import type { Metadata } from "next";
import { fetchCars, FUEL_FILTERS } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Kia электро из Кореи — каталог и цены | EncarKorea",
  description:
    "Электрические Kia из Южной Кореи: EV6, EV9, Niro EV. Корейские электромобили Kia с доставкой в Россию. Большой запас хода, современные технологии, выгодная цена.",
};

export default async function KiaElectricPage() {
  const allStoreCars = getCarsWithBooked();
  const electric = FUEL_FILTERS.electric;
  let cars = allStoreCars.filter((c) => c.manufacturerKey === "kia" && c.fuelType === electric);
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "kia", fuelType: electric });
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
          <span className="text-text-primary">Электро</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Электрические Kia из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          EV6, EV9 и Niro EV с корейского рынка. Электромобили Kia покоряют запасом хода до 500 км,
          быстрой зарядкой 800 В и просторным салоном. Пригон из Кореи позволяет сэкономить
          по сравнению с официальными ценами в России.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
