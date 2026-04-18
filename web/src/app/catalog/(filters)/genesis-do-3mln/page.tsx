import type { Metadata } from "next";
import { fetchCars } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Genesis из Кореи до 3 млн ₽ — каталог | EncarKorea",
  description:
    "Премиальные Genesis из Южной Кореи до 3 млн рублей. G70, G80, GV70 с доставкой в Россию за 14 дней.",
};

export default async function GenesisDo3MlnPage() {
  const allStoreCars = getCarsWithBooked();
  let cars = allStoreCars.filter(
    (c) => c.manufacturerKey === "genesis" && c.priceRUB > 0 && c.priceRUB <= 3000000
  );
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "genesis" });
    cars = result.cars
      .filter((c) => c.priceRUB > 0 && c.priceRUB <= 3000000)
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
            href="/catalog/genesis"
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Genesis
          </a>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary">До 3 млн ₽</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Genesis из Кореи до 3 000 000 ₽
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Премиальные Genesis из Южной Кореи до 3 млн рублей. G70, G80, GV70 —
          роскошь и качество по доступной цене с доставкой в Россию.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
