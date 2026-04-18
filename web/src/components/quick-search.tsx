"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MANUFACTURER_LABELS } from "@/lib/encar-api";

const BRANDS = Object.entries(MANUFACTURER_LABELS)
  .filter(([slug]) =>
    ["hyundai", "kia", "genesis", "bmw", "mercedes", "toyota", "volvo", "porsche", "audi", "lexus"].includes(slug)
  )
  .sort((a, b) => {
    const order = ["hyundai", "kia", "genesis", "bmw", "mercedes", "toyota", "volvo", "audi", "porsche", "lexus"];
    return order.indexOf(a[0]) - order.indexOf(b[0]);
  });

export function QuickSearch() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (priceMax) params.set("price_max", priceMax);
    const qs = params.toString();

    if (brand && !priceMax) {
      router.push(`/catalog/${brand}`);
    } else {
      router.push(qs ? `/catalog?${qs}` : "/catalog");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-lg p-5 sm:p-6 mt-10 max-w-3xl">
      <p className="text-[15px] font-semibold text-text-primary mb-4">
        Быстрый подбор
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="flex-1 h-12 px-4 bg-bg-surface border border-border rounded-xl text-[14px] text-text-primary cursor-pointer focus:outline-none focus:border-accent transition-colors appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
        >
          <option value="">Все марки</option>
          {BRANDS.map(([slug, label]) => (
            <option key={slug} value={slug}>{label}</option>
          ))}
        </select>

        <select
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="flex-1 h-12 px-4 bg-bg-surface border border-border rounded-xl text-[14px] text-text-primary cursor-pointer focus:outline-none focus:border-accent transition-colors appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
        >
          <option value="">Любой бюджет</option>
          <option value="1587">до 1 млн ₽</option>
          <option value="3175">до 2 млн ₽</option>
          <option value="4762">до 3 млн ₽</option>
          <option value="7937">до 5 млн ₽</option>
        </select>

        <button
          onClick={handleSearch}
          className="h-12 px-8 bg-cta hover:bg-cta-hover text-white text-[15px] font-semibold rounded-xl transition-colors duration-150 cursor-pointer shadow-sm whitespace-nowrap"
        >
          Найти авто
        </button>
      </div>

      {/* Быстрые ссылки на марки */}
      <div className="flex flex-wrap gap-2 mt-4">
        {BRANDS.slice(0, 6).map(([slug, label]) => (
          <a
            key={slug}
            href={`/catalog/${slug}`}
            className="px-3 py-1.5 text-[12px] font-medium text-text-secondary bg-bg-surface hover:bg-accent-soft hover:text-accent border border-border rounded-lg transition-colors duration-150 cursor-pointer"
          >
            {label}
          </a>
        ))}
        <a
          href="/catalog"
          className="px-3 py-1.5 text-[12px] font-medium text-accent bg-accent-soft border border-accent/15 rounded-lg cursor-pointer hover:bg-accent-light transition-colors duration-150"
        >
          Все марки →
        </a>
      </div>
    </div>
  );
}
