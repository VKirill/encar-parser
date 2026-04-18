import type { Metadata } from "next";
import { fetchCars, FUEL_FILTERS } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Hyundai электро из Кореи — каталог и цены | EncarKorea",
  description:
    "Электрические Hyundai из Южной Кореи: IONIQ 5, IONIQ 6, Kona Electric. Покупка EV с корейского рынка с доставкой в Россию. Выгодные цены, полная история авто через Encar.",
};

export default async function HyundaiElectricPage() {
  const allStoreCars = getCarsWithBooked();
  const electric = FUEL_FILTERS.electric;
  let cars = allStoreCars.filter((c) => c.manufacturerKey === "hyundai" && c.fuelType === electric);
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "hyundai", fuelType: electric });
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
          <span className="text-text-primary">Электро</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Электрические Hyundai из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          IONIQ 5, IONIQ 6 и Kona Electric с корейского рынка. Электромобили Hyundai отличаются
          передовыми технологиями зарядки, большим запасом хода и богатой комплектацией. Пригон EV
          из Кореи — выгоднее европейских и американских аналогов.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
