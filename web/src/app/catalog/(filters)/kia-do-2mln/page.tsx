import type { Metadata } from "next";
import { fetchCars } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Kia из Кореи до 2 млн ₽ — каталог | EncarKorea",
  description:
    "Доступные Kia из Южной Кореи с доставкой до 2 млн рублей. Rio, Cerato, Sportage в бюджетном сегменте.",
};

export default async function KiaDo2MlnPage() {
  const allStoreCars = getCarsWithBooked();
  let cars = allStoreCars.filter(
    (c) => c.manufacturerKey === "kia" && c.priceRUB > 0 && c.priceRUB <= 2000000
  );
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "kia" });
    cars = result.cars
      .filter((c) => c.priceRUB > 0 && c.priceRUB <= 2000000)
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
            href="/catalog/kia"
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Kia
          </a>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary">До 2 млн ₽</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Kia из Кореи до 2 000 000 ₽
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Доступные Kia из Южной Кореи до 2 млн рублей. Rio, Cerato, Sportage —
          надёжные автомобили с отличным соотношением цены и качества.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
