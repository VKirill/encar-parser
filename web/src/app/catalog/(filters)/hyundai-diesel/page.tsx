import type { Metadata } from "next";
import { fetchCars, FUEL_FILTERS } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Hyundai дизель из Кореи — каталог и цены | EncarKorea",
  description:
    "Дизельные Hyundai из Южной Кореи от 1,5 млн ₽. Tucson дизель, Santa Fe дизель, Palisade дизель с доставкой в Россию за 14 дней. Честные цены, полное сопровождение.",
};

export default async function HyundaiDieselPage() {
  const allStoreCars = getCarsWithBooked();
  const diesel = FUEL_FILTERS.diesel;
  let cars = allStoreCars.filter((c) => c.manufacturerKey === "hyundai" && c.fuelType === diesel);
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "hyundai", fuelType: diesel });
    cars = result.cars.map((c) => ({ ...c, status: "active" as const }));
    total = result.total;
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <nav
          className="flex items-center gap-2 text-[13px] text-text-secondary mb-4 flex-wrap"
          aria-label="Хлебные крошки"
        >
          <a href="/" className="hover:text-text-primary transition-colors cursor-pointer">
            Главная
          </a>
          <span className="text-text-muted">/</span>
          <a href="/catalog" className="hover:text-text-primary transition-colors cursor-pointer">
            Каталог
          </a>
          <span className="text-text-muted">/</span>
          <a
            href="/catalog/hyundai"
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Hyundai
          </a>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary">Дизель</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Дизельные Hyundai из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Дизельные модели Hyundai — экономичные и мощные. Tucson дизель, Santa Fe дизель, Palisade
          дизель с доставкой в Россию. Низкий расход топлива и высокий ресурс двигателя делают
          дизельный Hyundai идеальным выбором для дальних поездок.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
