import type { Metadata } from "next";
import { fetchCars, FUEL_FILTERS } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Электромобили из Кореи — каталог | EncarKorea",
  description:
    "Электромобили из Южной Кореи с доставкой в Россию. Hyundai Ioniq 5/6, KIA EV6, Genesis Electrified GV70 и другие EV с корейского рынка.",
};

export default async function ElectricPage() {
  const allStoreCars = getCarsWithBooked();
  const electric = FUEL_FILTERS.electric;
  let cars = allStoreCars.filter((c) => c.fuelType === electric);
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, fuelType: electric });
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
          <span className="text-text-primary">Электромобили</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Электромобили из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Корейские электромобили — высокое качество и современные технологии. Популярные модели:
          Hyundai Ioniq 5, Hyundai Ioniq 6, KIA EV6, Genesis Electrified GV70.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
