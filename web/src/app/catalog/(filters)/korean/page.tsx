import type { Metadata } from "next";
import { fetchCars } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Корейские автомобили — каталог | EncarKorea",
  description:
    "Корейские автомобили с площадки Encar с доставкой в Россию. Hyundai, Kia, Genesis, SsangYong, Renault Korea — лучшие марки по выгодным ценам.",
};

const KOREAN_BRAND_SLUGS = new Set(["hyundai", "kia", "genesis", "chevrolet", "ssangyong", "renault"]);

export default async function KoreanPage() {
  const allStoreCars = getCarsWithBooked();
  let cars = allStoreCars.filter((c) => KOREAN_BRAND_SLUGS.has(c.manufacturerKey));
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, carType: "Y" });
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
          <span className="text-text-primary">Корейские</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Корейские автомобили
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Корейские автомобили — оптимальное сочетание качества и цены. Hyundai, Kia, Genesis,
          SsangYong, Renault Korea с корейского рынка с доставкой в Россию.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
