"""
Encar.com Parser — парсер корейских автомобилей с encar.com

Использует публичный API encar.com для получения списка автомобилей.
Поддержка пагинации, фильтров, экспорта в JSON/CSV.
"""

import csv
import json
import logging
import time
from dataclasses import dataclass, field, asdict
from typing import Optional
from urllib.parse import quote

import requests
from fake_useragent import UserAgent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

API_BASE = "https://api.encar.com"
SEARCH_ENDPOINT = f"{API_BASE}/search/car/list/premium"
PHOTO_BASE = "https://ci.encar.com"
DETAIL_URL = "https://www.encar.com/dc/dc_cardetailview.do?carid={car_id}"

# Корейские названия производителей для фильтрации
MANUFACTURERS = {
    "hyundai": "현대",
    "kia": "기아",
    "genesis": "제네시스",
    "chevrolet": "쉐보레(GM대우)",
    "ssangyong": "KG모빌리티(쌍용)",
    "renault": "르노코리아(삼성)",
    "bmw": "BMW",
    "mercedes": "벤츠",
    "audi": "Audi",
    "volkswagen": "폭스바겐",
    "toyota": "도요타",
    "honda": "혼다",
    "volvo": "볼보",
    "porsche": "포르쉐",
    "land_rover": "랜드로버",
    "jaguar": "재규어",
    "lexus": "렉서스",
    "tesla": "테슬라",
    "ford": "포드",
    "jeep": "지프",
}

FUEL_TYPES = {
    "gasoline": "가솔린",
    "diesel": "디젤",
    "lpg": "LPG",
    "hybrid": "가솔린+전기",
    "electric": "전기",
}

TRANSMISSIONS = {
    "auto": "오토",
    "manual": "수동",
}


@dataclass
class CarListing:
    id: str = ""
    manufacturer: str = ""
    model: str = ""
    badge: str = ""
    badge_detail: str = ""
    year: int = 0
    form_year: str = ""
    price_万won: int = 0
    price_krw: int = 0
    mileage_km: int = 0
    fuel_type: str = ""
    transmission: str = ""
    color: str = ""
    sell_type: str = ""
    office_city: str = ""
    office_name: str = ""
    dealer_name: str = ""
    modified_date: str = ""
    photo_url: str = ""
    detail_url: str = ""
    photos: list = field(default_factory=list)
    trust: list = field(default_factory=list)
    condition: list = field(default_factory=list)

    @classmethod
    def from_api(cls, raw: dict) -> "CarListing":
        car_id = str(raw.get("Id", ""))
        year_raw = raw.get("Year", 0)
        year = int(year_raw) // 100 if year_raw else 0
        price_man = int(raw.get("Price", 0))

        photo_path = raw.get("Photo", "")
        main_photo = f"{PHOTO_BASE}{photo_path}001.jpg" if photo_path else ""

        photos = []
        for p in raw.get("Photos", []):
            loc = p.get("location", "")
            if loc:
                photos.append(f"{PHOTO_BASE}{loc}")

        return cls(
            id=car_id,
            manufacturer=raw.get("Manufacturer", ""),
            model=raw.get("Model", ""),
            badge=raw.get("Badge", ""),
            badge_detail=raw.get("BadgeDetail", ""),
            year=year,
            form_year=raw.get("FormYear", ""),
            price_万won=price_man,
            price_krw=price_man * 10000,
            mileage_km=int(raw.get("Mileage", 0)),
            fuel_type=raw.get("FuelType", ""),
            transmission=raw.get("Transmission", ""),
            color=raw.get("Color", ""),
            sell_type=raw.get("SellType", ""),
            office_city=raw.get("OfficeCityState", ""),
            office_name=raw.get("OfficeName", ""),
            dealer_name=raw.get("DealerName", ""),
            modified_date=raw.get("ModifiedDate", ""),
            photo_url=main_photo,
            detail_url=DETAIL_URL.format(car_id=car_id),
            photos=photos,
            trust=raw.get("Trust", []),
            condition=raw.get("Condition", []),
        )


class EncarParser:
    """Парсер encar.com через публичный API."""

    def __init__(self, delay: float = 1.0):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": UserAgent().chrome,
            "Accept": "application/json",
            "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
            "Referer": "https://www.encar.com/",
        })
        self.delay = delay

    def _build_query(
        self,
        car_type: str = "Y",
        manufacturer: Optional[str] = None,
        fuel_type: Optional[str] = None,
        price_min: Optional[int] = None,
        price_max: Optional[int] = None,
        mileage_max: Optional[int] = None,
        year_min: Optional[int] = None,
    ) -> str:
        """Построить строку фильтра q= для API encar."""
        parts = ["Hidden.N"]

        if car_type:
            parts.append(f"CarType.{car_type}")

        if manufacturer:
            ko_name = MANUFACTURERS.get(manufacturer.lower(), manufacturer)
            parts.append(f"Manufacturer.{ko_name}")

        if fuel_type:
            ko_fuel = FUEL_TYPES.get(fuel_type.lower(), fuel_type)
            parts.append(f"FuelType.{ko_fuel}")

        if price_min is not None or price_max is not None:
            lo = price_min if price_min else ""
            hi = price_max if price_max else ""
            parts.append(f"Price.range({lo}..{hi})")

        if mileage_max is not None:
            parts.append(f"Mileage.range(..{mileage_max})")

        if year_min is not None:
            ym = year_min * 100
            parts.append(f"Year.range({ym}..)")

        inner = "._.".join(parts)
        return f"(And.{inner}.)"

    def fetch_page(
        self,
        query: str,
        offset: int = 0,
        limit: int = 50,
        sort: str = "ModifiedDate",
    ) -> tuple[list[dict], int]:
        """Получить одну страницу результатов. Возвращает (items, total_count)."""
        sr = f"|{sort}|{offset}|{limit}"
        params = {
            "count": "true",
            "q": query,
            "sr": sr,
        }

        resp = self.session.get(SEARCH_ENDPOINT, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        items = data.get("SearchResults", [])
        total = data.get("Count", 0)
        return items, total

    def parse(
        self,
        max_cars: int = 100,
        page_size: int = 50,
        sort: str = "ModifiedDate",
        manufacturer: Optional[str] = None,
        fuel_type: Optional[str] = None,
        price_min: Optional[int] = None,
        price_max: Optional[int] = None,
        mileage_max: Optional[int] = None,
        year_min: Optional[int] = None,
        car_type: str = "Y",
    ) -> list[CarListing]:
        """
        Основной метод парсинга.

        Args:
            max_cars: максимальное кол-во машин для загрузки
            page_size: размер страницы (макс ~50)
            sort: сортировка — ModifiedDate, Year, Price, Mileage
            manufacturer: фильтр по производителю (англ. имя или корейское)
            fuel_type: тип топлива: gasoline, diesel, lpg, hybrid, electric
            price_min: мин. цена (в 만원, 10,000 KRW). 1000 = 10,000,000 KRW
            price_max: макс. цена (в 만원)
            mileage_max: макс. пробег (км)
            year_min: минимальный год выпуска (2020, 2023...)
            car_type: Y=корейские, N=импортные
        """
        query = self._build_query(
            car_type=car_type,
            manufacturer=manufacturer,
            fuel_type=fuel_type,
            price_min=price_min,
            price_max=price_max,
            mileage_max=mileage_max,
            year_min=year_min,
        )

        log.info(f"Query: {query}")
        log.info(f"Fetching up to {max_cars} cars, page size {page_size}")

        all_cars: list[CarListing] = []
        offset = 0

        while offset < max_cars:
            chunk_size = min(page_size, max_cars - offset)

            try:
                items, total = self.fetch_page(query, offset=offset, limit=chunk_size, sort=sort)
            except requests.RequestException as e:
                log.error(f"API error at offset {offset}: {e}")
                break

            if not items:
                log.info("No more results")
                break

            for raw in items:
                car = CarListing.from_api(raw)
                all_cars.append(car)

            log.info(f"Fetched {len(all_cars)}/{min(max_cars, total)} (total available: {total})")

            offset += len(items)

            if offset >= total:
                break

            if self.delay > 0:
                time.sleep(self.delay)

        log.info(f"Done. Total cars parsed: {len(all_cars)}")
        return all_cars


def save_json(cars: list[CarListing], path: str) -> None:
    """Сохранить в JSON."""
    data = [asdict(c) for c in cars]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    log.info(f"Saved {len(cars)} cars to {path}")


def save_csv(cars: list[CarListing], path: str) -> None:
    """Сохранить в CSV (без вложенных полей photos/trust/condition)."""
    if not cars:
        return

    flat_fields = [
        "id", "manufacturer", "model", "badge", "badge_detail",
        "year", "form_year", "price_万won", "price_krw", "mileage_km",
        "fuel_type", "transmission", "color", "sell_type",
        "office_city", "office_name", "dealer_name",
        "modified_date", "photo_url", "detail_url",
    ]

    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=flat_fields)
        writer.writeheader()
        for car in cars:
            row = {k: getattr(car, k, "") for k in flat_fields}
            writer.writerow(row)

    log.info(f"Saved {len(cars)} cars to {path}")
