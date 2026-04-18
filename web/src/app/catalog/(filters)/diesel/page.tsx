import type { Metadata } from "next";
import { fetchCars, FUEL_FILTERS } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Дизельные автомобили из Кореи — каталог | EncarKorea",
  description:
    "Дизельные автомобили из Южной Кореи с ценами в рублях. Hyundai, Kia, Genesis и другие марки с дизельными двигателями.",
};

export default async function DieselPage() {
  const allStoreCars = getCarsWithBooked();
  const diesel = FUEL_FILTERS.diesel;
  let cars = allStoreCars.filter((c) => c.fuelType === diesel);
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, fuelType: diesel });
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
          <span className="text-text-primary">Дизель</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Дизельные автомобили из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Дизельные авто отличаются экономичностью и тяговитостью. Популярные модели: Hyundai Santa
          Fe, KIA Sorento, Hyundai Tucson дизель.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
