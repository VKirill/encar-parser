#!/usr/bin/env python3
"""
CLI для парсера encar.com

Примеры:
    # Последние 100 корейских авто
    python run.py

    # 500 машин Hyundai, сохранить в CSV
    python run.py --max 500 --manufacturer hyundai --csv hyundai.csv

    # Genesis от 3000万원, не старше 2022
    python run.py --manufacturer genesis --price-min 3000 --year-min 2022

    # Импортные авто (не корейские), дизель, до 50к км
    python run.py --car-type N --fuel diesel --mileage-max 50000

    # Электромобили до 2000万원
    python run.py --fuel electric --price-max 2000

    # Сортировка по цене
    python run.py --sort Price --max 50
"""

import argparse
import sys

from encar_parser import EncarParser, save_json, save_csv, MANUFACTURERS, FUEL_TYPES


def main():
    parser = argparse.ArgumentParser(
        description="Encar.com Parser — парсер корейских автомобилей",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Производители (--manufacturer):
  """ + ", ".join(sorted(MANUFACTURERS.keys())) + """

Типы топлива (--fuel):
  """ + ", ".join(sorted(FUEL_TYPES.keys())) + """

Цены указываются в 万원 (10,000 KRW):
  1000 = 10,000,000 KRW (~$7,500)
  3000 = 30,000,000 KRW (~$22,500)
  5000 = 50,000,000 KRW (~$37,500)

Сортировка (--sort):
  ModifiedDate — по дате обновления (по умолчанию)
  Year — по году выпуска
  Mileage — по пробегу
""",
    )

    parser.add_argument("--max", type=int, default=100,
                        help="Максимум машин (default: 100)")
    parser.add_argument("--page-size", type=int, default=50,
                        help="Размер страницы API (default: 50)")
    parser.add_argument("--sort", default="ModifiedDate",
                        choices=["ModifiedDate", "Year", "Mileage"],
                        help="Сортировка (default: ModifiedDate)")
    parser.add_argument("--delay", type=float, default=1.0,
                        help="Задержка между запросами, сек (default: 1.0)")

    # Фильтры
    parser.add_argument("--manufacturer", "-m",
                        help="Производитель (hyundai, kia, genesis, bmw...)")
    parser.add_argument("--fuel", "-f",
                        help="Тип топлива (gasoline, diesel, hybrid, electric, lpg)")
    parser.add_argument("--price-min", type=int,
                        help="Мин. цена в 万원 (1000 = 10M KRW)")
    parser.add_argument("--price-max", type=int,
                        help="Макс. цена в 万원")
    parser.add_argument("--mileage-max", type=int,
                        help="Макс. пробег в км")
    parser.add_argument("--year-min", type=int,
                        help="Мин. год выпуска (2020, 2023...)")
    parser.add_argument("--car-type", default="Y",
                        choices=["Y", "N"],
                        help="Y=корейские, N=импортные (default: Y)")

    # Вывод
    parser.add_argument("--json", "-j", default="cars.json",
                        help="Путь для JSON (default: cars.json)")
    parser.add_argument("--csv", "-c",
                        help="Путь для CSV (опционально)")
    parser.add_argument("--no-json", action="store_true",
                        help="Не сохранять JSON")

    args = parser.parse_args()

    encar = EncarParser(delay=args.delay)

    cars = encar.parse(
        max_cars=args.max,
        page_size=args.page_size,
        sort=args.sort,
        manufacturer=args.manufacturer,
        fuel_type=args.fuel,
        price_min=args.price_min,
        price_max=args.price_max,
        mileage_max=args.mileage_max,
        year_min=args.year_min,
        car_type=args.car_type,
    )

    if not cars:
        print("Машины не найдены")
        sys.exit(1)

    if not args.no_json:
        save_json(cars, args.json)

    if args.csv:
        save_csv(cars, args.csv)

    # Вывод сводки
    print(f"\n{'='*60}")
    print(f"Найдено: {len(cars)} автомобилей")
    print(f"{'='*60}")

    manufacturers = {}
    price_sum = 0
    mileage_sum = 0

    for car in cars:
        manufacturers[car.manufacturer] = manufacturers.get(car.manufacturer, 0) + 1
        price_sum += car.price_krw
        mileage_sum += car.mileage_km

    print(f"\nСредняя цена: {price_sum // len(cars):,} KRW")
    print(f"Средний пробег: {mileage_sum // len(cars):,} км")
    print(f"\nПо производителям:")
    for mfr, count in sorted(manufacturers.items(), key=lambda x: -x[1]):
        print(f"  {mfr}: {count}")

    print(f"\nПервые 5 машин:")
    for car in cars[:5]:
        print(f"  {car.manufacturer} {car.model} {car.badge} "
              f"({car.form_year}) — {car.price_krw:,} KRW, "
              f"{car.mileage_km:,} км")


if __name__ == "__main__":
    main()
