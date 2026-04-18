"use client";

import { MANUFACTURER_LABELS } from "@/lib/encar-api";

// Группы: корейские, европейские, японские, другие
const BRAND_GROUPS = [
  {
    label: "Корейские",
    brands: ["hyundai", "kia", "genesis", "ssangyong", "renault", "chevrolet"],
  },
  {
    label: "Европейские",
    brands: ["bmw", "mercedes", "audi", "volkswagen", "volvo", "porsche"],
  },
  {
    label: "Японские",
    brands: ["toyota", "honda", "lexus"],
  },
  {
    label: "Другие",
    brands: ["tesla"],
  },
];

export function CarFilter({
  selected,
  onChange,
  counts,
  total,
}: {
  selected: string;
  onChange: (brand: string) => void;
  counts: Record<string, number>;
  total: number;
}) {
  return (
    <div className="space-y-4">
      {/* All button */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange("")}
          className={`px-4 py-2 rounded-xl text-[14px] font-medium transition-all duration-150 cursor-pointer ${
            selected === ""
              ? "bg-accent text-white"
              : "bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-border-hover"
          }`}
        >
          Все марки
          <span className="ml-1.5 text-[12px] opacity-70">{total}</span>
        </button>
      </div>

      {/* Brand groups */}
      {BRAND_GROUPS.map((group) => {
        const visibleBrands = group.brands.filter(
          (b) => (counts[b] ?? 0) > 0
        );
        if (visibleBrands.length === 0) return null;

        return (
          <div key={group.label}>
            <p className="text-[11px] uppercase tracking-wider text-text-muted mb-2 font-medium">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleBrands.map((brandKey) => {
                const label = MANUFACTURER_LABELS[brandKey] ?? brandKey;
                const count = counts[brandKey] ?? 0;
                const isSelected = selected === brandKey;

                return (
                  <button
                    key={brandKey}
                    onClick={() => onChange(isSelected ? "" : brandKey)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-accent text-white"
                        : "bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-border-hover"
                    }`}
                  >
                    {label}
                    <span className="ml-1 text-[11px] opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
