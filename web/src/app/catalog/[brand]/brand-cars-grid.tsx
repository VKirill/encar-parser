"use client";

import { useState } from "react";
import type { CarListing } from "@/lib/encar-api";
import { CarCard } from "@/components/car-card";
import { LeadForm } from "@/components/lead-form";

interface BrandCarsGridProps {
  cars: CarListing[];
}

export function BrandCarsGrid({ cars }: BrandCarsGridProps) {
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);

  if (cars.length === 0) {
    return (
      <p className="text-[14px] text-text-secondary py-8 text-center">
        Автомобили этой марки временно отсутствуют. Оставьте заявку — мы подберём для вас.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} onRequestClick={setSelectedCar} />
        ))}
      </div>
      <LeadForm car={selectedCar} onClose={() => setSelectedCar(null)} />
    </>
  );
}
