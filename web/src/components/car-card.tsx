"use client";

import { useState } from "react";
import type { CarListing } from "@/lib/encar-api";

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function CarCard({
  car,
  onRequestClick,
}: {
  car: CarListing & { status?: "active" | "booked" };
  onRequestClick: (car: CarListing) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const isBooked = car.status === "booked";
  const photos = car.photos.length ? car.photos : car.photoUrl ? [car.photoUrl] : [];
  const currentPhoto = photos[imgIdx] ?? "";

  return (
    <div className={`group bg-bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 animate-fade-in ${isBooked ? "opacity-75 grayscale pointer-events-none" : "hover:shadow-md hover:border-accent/30"}`}>
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-bg-surface overflow-hidden">
        {currentPhoto && !imgError ? (
          <img
            src={currentPhoto}
            alt={`${car.manufacturer} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9" />
              <path d="M10 6l-1 5h7" />
            </svg>
          </div>
        )}

        {/* Booked overlay */}
        {isBooked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
              <p className="text-[14px] font-semibold text-text-primary">Забронировано</p>
              <p className="text-[11px] text-text-muted mt-0.5">Клиент оформляет покупку</p>
            </div>
          </div>
        )}

        {/* Photo navigation dots */}
        {photos.length > 1 && !isBooked && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {photos.slice(0, 6).map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIdx(i);
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === imgIdx
                    ? "bg-white w-3"
                    : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        {!isBooked && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {car.condition.includes("Inspection") && (
              <span className="px-2 py-0.5 bg-green/90 text-white text-[11px] font-medium rounded-full">
                Проверен
              </span>
            )}
            {car.trust.includes("ExtendWarranty") && (
              <span className="px-2 py-0.5 bg-blue/90 text-white text-[11px] font-medium rounded-full">
                Гарантия
              </span>
            )}
          </div>
        )}

        {/* Year badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium rounded-full">
            {car.formYear}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-[15px] font-semibold text-text-primary leading-tight">
            {car.manufacturer} {car.model}
          </h3>
          <p className="text-[13px] text-text-secondary mt-0.5 truncate">
            {car.badge} {car.badgeDetail}
          </p>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-muted">
              <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
            </svg>
            {formatPrice(car.mileageKm)} km
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-muted">
              <path d="M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3-3" /><path d="M4 15v-3a6 6 0 0 1 6-6h0" /><circle cx="14" cy="6" r="2" />
            </svg>
            {car.fuelTypeRu}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-muted">
              <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 12h4m-2-2v4" />
            </svg>
            {car.transmissionRu}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-muted">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />
            </svg>
            {car.officeCity}
          </div>
        </div>

        {/* Prices — RUB primary */}
        <div className="border-t border-border pt-3 mb-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-[17px] sm:text-lg font-bold ${isBooked ? "text-text-muted" : "text-accent"}`}>
              ~{formatPrice(car.priceRUB)} &#8381;
            </span>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            {formatPrice(car.priceKRW)} KRW &middot; + таможня и доставка
          </p>
        </div>

        {/* Actions — скрыты для забронированных */}
        {!isBooked && (
          <div className="flex sm:flex-row flex-col gap-2">
            <a
              href={`/catalog/${car.manufacturerKey || "other"}/${car.id}/`}
              className="flex-1 h-11 bg-cta hover:bg-cta-hover text-white text-[14px] font-medium rounded-xl transition-colors duration-150 cursor-pointer flex items-center justify-center"
            >
              Узнать цену
            </a>
            <button
              onClick={() => onRequestClick(car)}
              className="h-11 sm:w-11 w-full flex items-center justify-center gap-2 border border-border rounded-xl text-text-muted hover:text-text-primary hover:border-border-hover transition-colors duration-150 cursor-pointer"
              title="Быстрая заявка"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="sm:hidden text-[14px] font-medium">Быстрая заявка</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
