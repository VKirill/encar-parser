import type { Metadata } from "next";
import { fetchCars, FUEL_FILTERS } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Гибридные Genesis из Кореи — каталог и цены | EncarKorea",
  description:
    "Гибридные Genesis из Южной Кореи. G80, GV80 гибрид с доставкой в Россию.",
};

export default async function GenesisHybridPage() {
  const allStoreCars = getCarsWithBooked();
  const hybrid = FUEL_FILTERS.hybrid;
  let cars = allStoreCars.filter((c) => c.manufacturerKey === "genesis" && c.fuelType === hybrid);
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "genesis", fuelType: hybrid });
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
            href="/catalog/genesis"
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Genesis
          </a>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary">Гибрид</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Гибридные Genesis из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Гибридные Genesis сочетают мощность бензинового двигателя с экономичностью электромотора.
          Премиальный комфорт по корейским ценам.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
