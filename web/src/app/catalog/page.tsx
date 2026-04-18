import type { Metadata } from "next";
import { fetchCars } from "@/lib/encar-api";
import { getCarsWithBooked } from "@/lib/car-store";
import { CatalogClient } from "./catalog-client";

export const metadata: Metadata = {
  title: "Каталог автомобилей из Кореи — цены и фильтры | EncarKorea",
  description:
    "Каталог автомобилей из Южной Кореи с ценами в рублях. Фильтр по марке, топливу, году, пробегу. Hyundai, Kia, Genesis и другие.",
};

export default async function CatalogPage() {
  const storeCars = getCarsWithBooked();

  if (storeCars.length === 0) {
    const { cars, total } = await fetchCars({ limit: 200 });
    return <CatalogClient initialCars={cars} totalAvailable={total} />;
  }

  return <CatalogClient initialCars={storeCars} totalAvailable={storeCars.length} />;
}
