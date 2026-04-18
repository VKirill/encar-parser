"use client";

import { useState } from "react";
import type { CarListing as Car } from "@/lib/encar-api";
import { CarCard } from "./car-card";
import { LeadForm } from "./lead-form";

export function CarListing({ cars }: { cars: Car[] }) {
  const [requestCar, setRequestCar] = useState<Car | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} onRequestClick={setRequestCar} />
        ))}
      </div>
      <LeadForm car={requestCar} onClose={() => setRequestCar(null)} />
    </>
  );
}
