import type { Metadata } from "next";
import { fetchCars, FUEL_FILTERS } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Kia дизель из Кореи — каталог и цены | EncarKorea",
  description:
    "Дизельные Kia из Южной Кореи: Sorento дизель, Sportage дизель, Stinger дизель. Экономичные кроссоверы и седаны с доставкой в Россию. Прозрачная сделка через Encar.",
};

export default async function KiaDieselPage() {
  const allStoreCars = getCarsWithBooked();
  const diesel = FUEL_FILTERS.diesel;
  let cars = allStoreCars.filter((c) => c.manufacturerKey === "kia" && c.fuelType === diesel);
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "kia", fuelType: diesel });
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
            href="/catalog/kia"
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Kia
          </a>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary">Дизель</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Дизельные Kia из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Kia Sorento, Sportage и Carnival с дизельным двигателем. Надёжные и тяговитые кроссоверы
          Kia с корейского рынка по выгодным ценам. Экономия на топливе при городском и загородном
          использовании — до 30% по сравнению с бензиновыми аналогами.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
