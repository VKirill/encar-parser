"use client";

import { useState } from "react";
import type { CarListing } from "@/lib/encar-api";
import { CarCard } from "@/components/car-card";
import { LeadForm } from "@/components/lead-form";

interface SimilarCarsGridProps {
  cars: CarListing[];
}

export function SimilarCarsGrid({ cars }: SimilarCarsGridProps) {
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} onRequestClick={setSelectedCar} />
        ))}
      </div>
      <LeadForm car={selectedCar} onClose={() => setSelectedCar(null)} />
    </>
  );
}
