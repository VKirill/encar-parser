"use client";

import { useState } from "react";

interface CarGalleryProps {
  photos: string[];
  alt: string;
}

export function CarGallery({ photos, alt }: CarGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const currentPhoto = photos[activeIdx] ?? "";

  return (
    <div className="space-y-3">
      {/* Основное фото */}
      <div className="relative aspect-[4/3] bg-bg-surface rounded-2xl overflow-hidden">
        {currentPhoto && !imgError ? (
          <img
            src={currentPhoto}
            alt={`${alt} — фото ${activeIdx + 1}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9" />
              <path d="M10 6l-1 5h7" />
            </svg>
          </div>
        )}

        {/* Счётчик */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[12px] sm:text-[13px] font-medium rounded-full">
            {activeIdx + 1}/{photos.length}
          </div>
        )}
      </div>

      {/* Миниатюры */}
      {photos.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIdx(i);
                setImgError(false);
              }}
              style={{ scrollSnapAlign: "start" }}
              className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                i === activeIdx
                  ? "border-accent"
                  : "border-border hover:border-border-hover"
              }`}
            >
              <img
                src={photo}
                alt={`${alt} — миниатюра ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
