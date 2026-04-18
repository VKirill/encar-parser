import type { Metadata } from "next";
import { fetchCars, FUEL_FILTERS } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Электрические Genesis из Кореи — каталог и цены | EncarKorea",
  description:
    "Электромобили Genesis из Южной Кореи. Electrified G80, GV60, GV70 с доставкой в Россию. Экономия до 40%.",
};

export default async function GenesisElectricPage() {
  const allStoreCars = getCarsWithBooked();
  const electric = FUEL_FILTERS.electric;
  let cars = allStoreCars.filter((c) => c.manufacturerKey === "genesis" && c.fuelType === electric);
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "genesis", fuelType: electric });
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
          <span className="text-text-primary">Электро</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Электрические Genesis из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Genesis Electrified — премиальные электромобили с передовыми технологиями. GV60, Electrified
          G80, Electrified GV70 — роскошь и экологичность по корейским ценам.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
