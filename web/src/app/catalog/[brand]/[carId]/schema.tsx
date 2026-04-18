import type { CarListing } from "@/lib/encar-api";

export function generateVehicleSchema(car: CarListing, brandLabel: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${brandLabel} ${car.model} ${car.formYear}`,
    brand: { "@type": "Brand", name: brandLabel },
    model: car.model,
    vehicleModelDate: car.formYear,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.mileageKm,
      unitCode: "KMT",
    },
    fuelType: car.fuelTypeRu,
    vehicleTransmission: car.transmissionRu,
    image: car.photos.length ? car.photos[0] : car.photoUrl,
    url: `https://encar.vechkasov.pro/catalog/${car.manufacturerKey}/${car.id}/`,
    offers: {
      "@type": "Offer",
      price: car.priceRUB,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "EncarKorea",
      },
    },
  };
}
