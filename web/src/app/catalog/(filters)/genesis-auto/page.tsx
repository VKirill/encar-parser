import type { Metadata } from "next";
import { fetchCars } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "../../catalog-client";

export const metadata: Metadata = {
  title: "Genesis с АКПП из Кореи — каталог | EncarKorea",
  description:
    "Genesis с автоматической коробкой передач из Южной Кореи. G80, GV80, G90 с АКПП. Премиальные автомобили с доставкой в Россию.",
};

export default async function GenesisAutoPage() {
  const allStoreCars = getCarsWithBooked();
  let cars = allStoreCars.filter(
    (c) => c.manufacturerKey === "genesis" && c.transmission === "오토"
  );
  let total = cars.length;

  if (total === 0) {
    const result = await fetchCars({ limit: 200, manufacturer: "genesis" });
    cars = result.cars
      .filter((c) => c.transmission === "오토")
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
          <span className="text-text-primary">АКПП</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Genesis с автоматической коробкой из Кореи
        </h1>
        <p className="text-[15px] text-text-secondary mb-8 max-w-2xl">
          Премиальные Genesis с АКПП — роскошь и технологии. G80, GV80, G90 и другие
          модели с автоматической коробкой передач из Южной Кореи с доставкой в Россию.
        </p>
      </div>
      <CatalogClient initialCars={cars} totalAvailable={total} gridOnly />
    </div>
  );
}
