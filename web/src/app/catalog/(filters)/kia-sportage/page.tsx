import type { Metadata } from "next";
import { fetchCars } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Kia Sportage из Кореи — цены | EncarKorea",
  description:
    "Kia Sportage всех поколений из Южной Кореи. Бензин, дизель, гибрид. Популярный кроссовер с доставкой в Россию от 1,5 млн ₽.",
};

export default async function KiaSportagePage() {
  const allStoreCars = getCarsWithBooked();
  let cars = allStoreCars.filter(
    (c) => c.manufacturerKey === "kia" && c.model.includes("스포티지")
  );
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "kia" });
    cars = result.cars
      .filter((c) => c.model.includes("스포티지"))
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
          <span className="text-text-primary">Sportage</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Kia Sportage из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Sportage — один из самых популярных кроссоверов для импорта из Кореи.
          Все поколения с бензиновым, дизельным и гибридным двигателем.
          Надёжный выбор с доставкой из Южной Кореи в Россию.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
