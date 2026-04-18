/**
 * Скрипт для загрузки данных из encar.com API в локальный кэш.
 * Запуск: npx tsx scripts/seed-cache.ts
 *
 * Загружает 500 авто порциями по 50 с задержкой 2 сек между запросами
 * чтобы не получить бан от API.
 */

const API = "https://api.encar.com/search/car/list/premium";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  "Referer": "https://www.encar.com/",
};

const BATCH_SIZE = 50;
const MAX_CARS = 500;
const DELAY_MS = 2000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const allItems: Record<string, unknown>[] = [];
  let totalAvailable = 0;

  for (let offset = 0; offset < MAX_CARS; offset += BATCH_SIZE) {
    const q = "(And.Hidden.N._.CarType.Y.)";
    const sr = `|ModifiedDate|${offset}|${BATCH_SIZE}`;
    const url = `${API}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;

    console.log(`Fetching offset=${offset}...`);

    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) {
      console.error(`API error: ${resp.status}. Stopping.`);
      break;
    }

    const data = await resp.json();
    const results = (data.SearchResults ?? []) as Record<string, unknown>[];
    totalAvailable = Number(data.Count ?? 0);

    allItems.push(...results);
    console.log(`  Got ${results.length} cars (total: ${allItems.length}/${totalAvailable})`);

    if (results.length < BATCH_SIZE) break;
    if (offset + BATCH_SIZE < MAX_CARS) await sleep(DELAY_MS);
  }

  if (allItems.length === 0) {
    console.error("No cars fetched. API might be blocked.");
    process.exit(1);
  }

  // Parse and save
  const { writeFileSync, mkdirSync, existsSync } = await import("fs");
  const { join } = await import("path");

  const cacheDir = join(process.cwd(), "data", "cache");
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

  // Save raw API data
  writeFileSync(join(cacheDir, "raw-api.json"), JSON.stringify(allItems, null, 2));
  console.log(`\nSaved ${allItems.length} raw items to data/cache/raw-api.json`);

  // Parse into CarListing format
  const KRW_TO_RUB = 0.063;
  const PHOTO_BASE = "https://ci.encar.com";
  const DETAIL_URL = "https://www.encar.com/dc/dc_cardetailview.do?carid=";

  const KOREAN_TO_SLUG: Record<string, string> = {
    "현대": "hyundai", "기아": "kia", "제네시스": "genesis",
    "쉐보레(GM대우)": "chevrolet", "KG모빌리티(쌍용)": "ssangyong",
    "르노코리아(삼성)": "renault", "BMW": "bmw", "벤츠": "mercedes",
    "Audi": "audi", "폭스바겐": "volkswagen", "도요타": "toyota",
    "혼다": "honda", "볼보": "volvo", "포르쉐": "porsche",
    "테슬라": "tesla", "렉서스": "lexus",
  };

  const FUEL_LABELS: Record<string, string> = {
    "가솔린": "Бензин", "디젤": "Дизель", "LPG": "LPG",
    "가솔린+전기": "Гибрид", "전기": "Электро", "LPG+전기": "LPG гибрид",
  };
  const TRANS_LABELS: Record<string, string> = {
    "오토": "АКПП", "수동": "МКПП", "CVT": "Вариатор",
  };

  const cars = allItems.map((raw) => {
    const id = String(raw.Id ?? "");
    const yearRaw = Number(raw.Year ?? 0);
    const year = yearRaw ? Math.floor(yearRaw / 100) : 0;
    const priceMan = Number(raw.Price ?? 0);
    const priceKRW = priceMan * 10000;
    const manufacturer = String(raw.Manufacturer ?? "");
    const model = String(raw.Model ?? "");
    const fuelType = String(raw.FuelType ?? "");
    const transmission = String(raw.Transmission ?? "");
    const photoPath = String(raw.Photo ?? "");

    const photosRaw = (raw.Photos as { location: string; ordering: number }[]) ?? [];
    const photos = photosRaw
      .sort((a, b) => a.ordering - b.ordering)
      .map((p) => `${PHOTO_BASE}${p.location}`)
      .slice(0, 10);

    const modelSlug = model.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    return {
      id, slug: `${id}-${modelSlug}-${year}`,
      manufacturer, manufacturerKey: KOREAN_TO_SLUG[manufacturer] ?? "",
      model, badge: String(raw.Badge ?? ""), badgeDetail: String(raw.BadgeDetail ?? ""),
      year, formYear: String(raw.FormYear ?? ""),
      priceMan, priceKRW, priceRUB: Math.round(priceKRW * KRW_TO_RUB),
      mileageKm: Number(raw.Mileage ?? 0),
      fuelType, fuelTypeRu: FUEL_LABELS[fuelType] ?? fuelType,
      transmission, transmissionRu: TRANS_LABELS[transmission] ?? transmission,
      sellType: String(raw.SellType ?? ""), officeCity: String(raw.OfficeCityState ?? ""),
      officeName: String(raw.OfficeName ?? ""), dealerName: String(raw.DealerName ?? ""),
      modifiedDate: String(raw.ModifiedDate ?? ""),
      photoUrl: photoPath ? `${PHOTO_BASE}${photoPath}001.jpg` : "",
      photos: photos.length ? photos : (photoPath ? [`${PHOTO_BASE}${photoPath}001.jpg`] : []),
      detailUrl: `${DETAIL_URL}${id}`,
      trust: (raw.Trust as string[]) ?? [],
      condition: (raw.Condition as string[]) ?? [],
    };
  });

  const cacheData = { timestamp: Date.now(), cars, total: totalAvailable };
  writeFileSync(join(cacheDir, "cars.json"), JSON.stringify(cacheData));
  console.log(`Saved ${cars.length} parsed cars to data/cache/cars.json`);
  console.log(`Total available on encar: ${totalAvailable}`);
}

main().catch(console.error);
