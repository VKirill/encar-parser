import type { Metadata } from "next";
import { fetchCars } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Импортные автомобили из Кореи — каталог | EncarKorea",
  description:
    "Импортные автомобили с корейского рынка: BMW, Mercedes-Benz, Audi, Toyota, Honda и другие иностранные марки по выгодным ценам с доставкой в Россию.",
};

const KOREAN_BRAND_SLUGS = new Set(["hyundai", "kia", "genesis", "chevrolet", "ssangyong", "renault"]);

export default async function ForeignPage() {
  const allStoreCars = getCarsWithBooked();
  let cars = allStoreCars.filter((c) => !KOREAN_BRAND_SLUGS.has(c.manufacturerKey));
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, carType: "N" });
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
          <span className="text-text-primary">Импортные</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Импортные автомобили из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Иностранные марки с корейского рынка по выгодным ценам: BMW, Mercedes-Benz, Audi,
          Volkswagen, Toyota, Honda, Volvo, Porsche, Tesla, Lexus.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
