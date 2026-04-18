import type { Metadata } from "next";
import { fetchCars } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Hyundai Santa Fe из Кореи — цены | EncarKorea",
  description:
    "Hyundai Santa Fe всех поколений из Южной Кореи. Просторный семейный кроссовер с бензиновым, дизельным и гибридным двигателем. Доставка в Россию.",
};

export default async function HyundaiSantaFePage() {
  const allStoreCars = getCarsWithBooked();
  let cars = allStoreCars.filter(
    (c) => c.manufacturerKey === "hyundai" && c.model.includes("싼타페")
  );
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "hyundai" });
    cars = result.cars
      .filter((c) => c.model.includes("싼타페"))
      .map((c) => ({ ...c, status: "active" as const }));
    total = cars.length;
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
          <span className="text-text-primary">Santa Fe</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Hyundai Santa Fe из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Santa Fe — просторный семейный кроссовер с высоким уровнем комфорта.
          Все поколения с бензиновым, дизельным и гибридным двигателем.
          Доставка из Южной Кореи в Россию за 14 дней.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
