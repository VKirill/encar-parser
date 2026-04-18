"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { CarListing } from "@/lib/encar-api";
import {
  MANUFACTURER_LABELS,
  FUEL_FILTERS,
  FUEL_FILTER_LABELS,
  TRANSMISSION_FILTER_LABELS,
  CAR_TYPE_LABELS,
  YEAR_OPTIONS,
  MILEAGE_OPTIONS,
  PRICE_OPTIONS,
} from "@/lib/encar-api";
import { CarCard } from "@/components/car-card";
import { LeadForm } from "@/components/lead-form";

// ─── Types ────────────────────────────────────────────────────────────────────

type CatalogCar = CarListing & { status?: "active" | "booked" };

type SortValue =
  | "date"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "year-asc"
  | "mileage-asc";

interface ActiveFilters {
  carType: string;
  brand: string;
  fuel: string;
  transmission: string;
  yearMin: string;
  yearMax: string;
  mileageMax: string;
  priceMax: string;
  sort: SortValue;
}

const DEFAULT_FILTERS: ActiveFilters = {
  carType: "",
  brand: "",
  fuel: "",
  transmission: "",
  yearMin: "",
  yearMax: "",
  mileageMax: "",
  priceMax: "",
  sort: "date",
};

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "date", label: "По дате" },
  { value: "price-asc", label: "Цена: по возрастанию" },
  { value: "price-desc", label: "Цена: по убыванию" },
  { value: "year-desc", label: "Год: сначала новые" },
  { value: "year-asc", label: "Год: сначала старые" },
  { value: "mileage-asc", label: "Пробег: по возрастанию" },
];

const CTA_BANNER_INTERVAL = 9;

// Марки, считающиеся корейскими (domestic)
const KOREAN_BRAND_SLUGS = new Set(["hyundai", "kia", "genesis", "chevrolet", "ssangyong", "renault"]);

// ─── URL helpers ──────────────────────────────────────────────────────────────

function readFiltersFromParams(params: URLSearchParams): ActiveFilters {
  return {
    carType: params.get("car_type") ?? "",
    brand: params.get("brand") ?? "",
    fuel: params.get("fuel") ?? "",
    transmission: params.get("transmission") ?? "",
    yearMin: params.get("year_min") ?? "",
    yearMax: params.get("year_max") ?? "",
    mileageMax: params.get("mileage_max") ?? "",
    priceMax: params.get("price_max") ?? "",
    sort: (params.get("sort") as SortValue) ?? "date",
  };
}

function buildParams(filters: ActiveFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.carType) p.set("car_type", filters.carType);
  if (filters.brand) p.set("brand", filters.brand);
  if (filters.fuel) p.set("fuel", filters.fuel);
  if (filters.transmission) p.set("transmission", filters.transmission);
  if (filters.yearMin) p.set("year_min", filters.yearMin);
  if (filters.yearMax) p.set("year_max", filters.yearMax);
  if (filters.mileageMax) p.set("mileage_max", filters.mileageMax);
  if (filters.priceMax) p.set("price_max", filters.priceMax);
  if (filters.sort !== "date") p.set("sort", filters.sort);
  return p;
}

// ─── Filtering & sorting ──────────────────────────────────────────────────────

function getFuelSlug(koreanFuel: string): string {
  for (const [slug, ko] of Object.entries(FUEL_FILTERS)) {
    if (ko === koreanFuel) return slug;
  }
  return "";
}

function getTransmissionSlug(koTransmission: string): string {
  if (koTransmission === "오토") return "auto";
  if (koTransmission === "수동") return "manual";
  return "";
}

function applyFilters(cars: CatalogCar[], filters: ActiveFilters): CatalogCar[] {
  return cars.filter((car) => {
    if (filters.carType) {
      const isKorean = KOREAN_BRAND_SLUGS.has(car.manufacturerKey);
      if (filters.carType === "korean" && !isKorean) return false;
      if (filters.carType === "foreign" && isKorean) return false;
    }
    if (filters.brand && car.manufacturerKey !== filters.brand) return false;
    if (filters.fuel && getFuelSlug(car.fuelType) !== filters.fuel) return false;
    if (filters.transmission && getTransmissionSlug(car.transmission) !== filters.transmission) return false;
    if (filters.yearMin && car.year < Number(filters.yearMin)) return false;
    if (filters.yearMax && car.year > Number(filters.yearMax)) return false;
    if (filters.mileageMax && car.mileageKm > Number(filters.mileageMax)) return false;
    if (filters.priceMax && car.priceMan > Number(filters.priceMax)) return false;
    return true;
  });
}

function sortCars(cars: CatalogCar[], sort: SortValue): CatalogCar[] {
  const sorted = [...cars];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.priceRUB - b.priceRUB);
    case "price-desc":
      return sorted.sort((a, b) => b.priceRUB - a.priceRUB);
    case "year-desc":
      return sorted.sort((a, b) => b.year - a.year);
    case "year-asc":
      return sorted.sort((a, b) => a.year - b.year);
    case "mileage-asc":
      return sorted.sort((a, b) => a.mileageKm - b.mileageKm);
    default:
      return sorted.sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate));
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconClose({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="16" y2="12" />
      <line x1="4" y1="18" x2="12" y2="18" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CtaBanner() {
  return (
    <div className="col-span-full bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center">
      <p className="text-[16px] font-semibold text-text-primary">
        Не нашли нужный автомобиль?
      </p>
      <p className="text-[14px] text-text-secondary mt-1">
        Мы подберём авто по вашим параметрам
      </p>
      <a
        href="#request"
        className="inline-flex h-10 px-6 bg-accent hover:bg-accent-hover text-white text-[14px] font-medium rounded-xl mt-3 items-center cursor-pointer transition-colors duration-200"
      >
        Оставить заявку
      </a>
    </div>
  );
}

interface ActiveChipsProps {
  filters: ActiveFilters;
  onRemove: (key: keyof ActiveFilters) => void;
}

function ActiveChips({ filters, onRemove }: ActiveChipsProps) {
  const chips: { key: keyof ActiveFilters; label: string }[] = [];

  if (filters.carType) chips.push({ key: "carType", label: CAR_TYPE_LABELS[filters.carType] ?? filters.carType });
  if (filters.brand) chips.push({ key: "brand", label: MANUFACTURER_LABELS[filters.brand] ?? filters.brand });
  if (filters.fuel) chips.push({ key: "fuel", label: FUEL_FILTER_LABELS[filters.fuel] ?? filters.fuel });
  if (filters.transmission) chips.push({ key: "transmission", label: TRANSMISSION_FILTER_LABELS[filters.transmission] ?? filters.transmission });
  if (filters.yearMin) chips.push({ key: "yearMin", label: `от ${filters.yearMin}` });
  if (filters.yearMax) chips.push({ key: "yearMax", label: `до ${filters.yearMax}` });
  if (filters.mileageMax) {
    const opt = MILEAGE_OPTIONS.find((o) => String(o.value) === filters.mileageMax);
    chips.push({ key: "mileageMax", label: opt?.label ?? `до ${filters.mileageMax} км` });
  }
  if (filters.priceMax) {
    const opt = PRICE_OPTIONS.find((o) => String(o.manWon) === filters.priceMax);
    chips.push({ key: "priceMax", label: opt?.label ?? `до ${filters.priceMax}` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 bg-accent/10 text-accent text-[13px] rounded-xl border border-accent/20"
        >
          {label}
          <button
            onClick={() => onRemove(key)}
            className="cursor-pointer hover:opacity-70 transition-opacity duration-200"
            aria-label={`Сбросить: ${label}`}
          >
            <IconClose size={14} />
          </button>
        </span>
      ))}
    </div>
  );
}

interface FilterPanelProps {
  filters: ActiveFilters;
  availableBrands: { slug: string; label: string; count: number }[];
  onFilterChange: (updates: Partial<ActiveFilters>) => void;
  onReset: () => void;
  hideBrandFilter?: boolean;
}

// Стили pills — используются в desktop и mobile
const PILL_BASE = "h-8 px-3 text-[12px] font-medium rounded-lg border transition-colors duration-150 cursor-pointer whitespace-nowrap";
const PILL_ACTIVE = "bg-accent text-white border-accent";
const PILL_INACTIVE = "bg-white text-text-secondary border-border hover:border-accent/30";
const SELECT_BASE = "h-11 px-3 bg-white border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent transition-colors duration-200 cursor-pointer appearance-none";

// Mobile-only: секции фильтров в bottom sheet
function FilterPanelContent({ filters, availableBrands, onFilterChange, onReset, hideBrandFilter }: FilterPanelProps) {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const TOP_BRANDS = 12;

  const brandPill = (slug: string, label: string, count: number) => (
    <button
      key={slug}
      onClick={() => onFilterChange({ brand: filters.brand === slug ? "" : slug })}
      className={`${PILL_BASE} ${filters.brand === slug ? PILL_ACTIVE : PILL_INACTIVE}`}
    >
      {label}
      <span className={`ml-1 text-[11px] ${filters.brand === slug ? "text-white/70" : "text-text-muted"}`}>
        {count}
      </span>
    </button>
  );

  const visibleBrands = showAllBrands ? availableBrands : availableBrands.slice(0, TOP_BRANDS);

  return (
    <div className="space-y-5">
      {/* Марка — скрыть если мы уже на brand-странице */}
      {!hideBrandFilter && (
        <div>
          <p className="text-[12px] uppercase tracking-wider text-text-muted font-medium mb-2">Марка</p>
          <div className="grid grid-cols-3 gap-1.5">
            {visibleBrands.map(({ slug, label, count }) => brandPill(slug, label, count))}
          </div>
          {availableBrands.length > TOP_BRANDS && !showAllBrands && (
            <button
              onClick={() => setShowAllBrands(true)}
              className="mt-2 text-[13px] text-accent cursor-pointer"
            >
              Ещё {availableBrands.length - TOP_BRANDS} марок
            </button>
          )}
        </div>
      )}

      {/* Топливо */}
      <div>
        <p className="text-[12px] uppercase tracking-wider text-text-muted font-medium mb-2">Топливо</p>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(FUEL_FILTER_LABELS).map(([slug, label]) => (
            <button
              key={slug}
              onClick={() => onFilterChange({ fuel: filters.fuel === slug ? "" : slug })}
              className={`${PILL_BASE} ${filters.fuel === slug ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* КПП */}
      <div>
        <p className="text-[12px] uppercase tracking-wider text-text-muted font-medium mb-2">Коробка передач</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TRANSMISSION_FILTER_LABELS).map(([slug, label]) => (
            <button
              key={slug}
              onClick={() => onFilterChange({ transmission: filters.transmission === slug ? "" : slug })}
              className={`${PILL_BASE} h-11 ${filters.transmission === slug ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Год */}
      <div>
        <p className="text-[12px] uppercase tracking-wider text-text-muted font-medium mb-2">Год выпуска</p>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={filters.yearMin}
            onChange={(e) => onFilterChange({ yearMin: e.target.value })}
            className={SELECT_BASE}
          >
            <option value="">от</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          <select
            value={filters.yearMax}
            onChange={(e) => onFilterChange({ yearMax: e.target.value })}
            className={SELECT_BASE}
          >
            <option value="">до</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Пробег */}
      <div>
        <p className="text-[12px] uppercase tracking-wider text-text-muted font-medium mb-2">Пробег</p>
        <select
          value={filters.mileageMax}
          onChange={(e) => onFilterChange({ mileageMax: e.target.value })}
          className={`${SELECT_BASE} w-full`}
        >
          <option value="">Любой</option>
          {MILEAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={String(opt.value)}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Цена */}
      <div>
        <p className="text-[12px] uppercase tracking-wider text-text-muted font-medium mb-2">Цена</p>
        <select
          value={filters.priceMax}
          onChange={(e) => onFilterChange({ priceMax: e.target.value })}
          className={`${SELECT_BASE} w-full`}
        >
          <option value="">Любая</option>
          {PRICE_OPTIONS.map((opt) => (
            <option key={opt.manWon} value={String(opt.manWon)}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface CatalogClientProps {
  initialCars: CatalogCar[];
  totalAvailable: number;
  /** Если задан — brand-фильтр скрыт и не попадает в URL (мы уже на странице марки) */
  contextBrand?: string;
  /** Если true — скрыть фильтры/хлебные крошки/заголовок, только grid + сортировка. Для SEO filter-страниц */
  gridOnly?: boolean;
}

export function CatalogClient(props: CatalogClientProps) {
  return <CatalogClientInner {...props} />;
}

function CatalogClientInner({ initialCars, totalAvailable, contextBrand, gridOnly }: CatalogClientProps) {
  const pathname = usePathname();

  // Читаем фильтры из URL после mount (без useSearchParams — мгновенный SSR)
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CatalogCar | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // После mount: читаем фильтры из URL
  useEffect(() => {
    if (gridOnly) { setHydrated(true); return; }
    try {
      const params = new URLSearchParams(window.location.search);
      const urlFilters = readFiltersFromParams(params);
      const hasFilters = Object.entries(urlFilters).some(
        ([k, v]) => k !== "sort" && v !== "" && v !== DEFAULT_FILTERS[k as keyof ActiveFilters]
      );
      if (hasFilters) setFilters(urlFilters);
    } catch { /* SSR */ }
    setHydrated(true);
  }, [gridOnly]);

  // Sync URL при изменении фильтров (после hydration)
  useEffect(() => {
    if (gridOnly || !hydrated) return;
    const params = buildParams(filters);
    if (contextBrand) params.delete("brand");
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    // Используем history.replaceState чтобы не триггерить Next.js navigation
    window.history.replaceState(null, "", newUrl);
  }, [filters, pathname, contextBrand, gridOnly, hydrated]);

  const updateFilters = useCallback((updates: Partial<ActiveFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const removeFilter = useCallback((key: keyof ActiveFilters) => {
    setFilters((prev) => ({ ...prev, [key]: key === "sort" ? "date" : "" }));
  }, []);

  const availableBrands = useMemo(() => {
    const countMap = new Map<string, number>();
    const nameMap = new Map<string, string>(); // slug → display label
    for (const car of initialCars) {
      if (car.manufacturerKey) {
        countMap.set(car.manufacturerKey, (countMap.get(car.manufacturerKey) ?? 0) + 1);
        if (!nameMap.has(car.manufacturerKey)) {
          nameMap.set(car.manufacturerKey, MANUFACTURER_LABELS[car.manufacturerKey] ?? car.manufacturerKey);
        }
      }
    }
    return Array.from(countMap.entries())
      .map(([slug, count]) => ({ slug, label: nameMap.get(slug) ?? slug, count }))
      .sort((a, b) => b.count - a.count);
  }, [initialCars]);

  const filtered = useMemo(() => {
    // Booked авто показываются всегда, не фильтруются
    const activeCars = initialCars.filter((c) => c.status !== "booked");
    const bookedCars = initialCars.filter((c) => c.status === "booked");
    const filteredActive = sortCars(applyFilters(activeCars, filters), filters.sort);
    return [...filteredActive, ...bookedCars];
  }, [initialCars, filters]);

  const activeFilterCount = useMemo(() => {
    return [
      filters.carType, filters.brand, filters.fuel, filters.transmission,
      filters.yearMin, filters.yearMax, filters.mileageMax, filters.priceMax,
    ].filter(Boolean).length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const bookedCount = useMemo(
    () => filtered.filter((c) => c.status === "booked").length,
    [filtered]
  );

  // Lazy loading: показываем по PAGE_SIZE и подгружаем при скролле
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Сбросить visibleCount при смене фильтров
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  // IntersectionObserver для infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);

  const visibleCars = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  function buildGrid() {
    const elements: React.ReactNode[] = [];
    visibleCars.forEach((car, i) => {
      elements.push(<CarCard key={car.id} car={car} onRequestClick={setSelectedCar} />);
      if ((i + 1) % CTA_BANNER_INTERVAL === 0 && i + 1 < visibleCars.length) {
        elements.push(<CtaBanner key={`cta-${i}`} />);
      }
    });
    return elements;
  }

  const panelProps: FilterPanelProps = {
    filters,
    availableBrands,
    onFilterChange: updateFilters,
    onReset: resetFilters,
    hideBrandFilter: !!contextBrand,
  };

  // gridOnly mode — simplified grid without filters/breadcrumbs (for SEO filter pages)
  if (gridOnly) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] text-text-secondary">
              {filtered.length} {filtered.length === 1 ? "автомобиль" : "автомобилей"}
            </p>
            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as SortValue })}
              className="h-10 px-3 bg-bg border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="date">По дате</option>
              <option value="price-asc">Цена ↑</option>
              <option value="price-desc">Цена ↓</option>
              <option value="year-desc">Новее</option>
              <option value="year-asc">Старше</option>
              <option value="mileage">Пробег ↑</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <p className="text-[16px] font-medium">Автомобили не найдены</p>
              <a href="/catalog" className="mt-3 inline-flex h-10 px-5 bg-accent hover:bg-accent-hover text-white text-[14px] font-medium rounded-xl items-center cursor-pointer transition-colors">
                Смотреть весь каталог
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {buildGrid()}
              </div>
              {hasMore && (
                <div ref={loadMoreRef} className="text-center py-8">
                  <p className="text-[13px] text-text-muted">
                    Показано {visibleCount} из {filtered.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <LeadForm car={selectedCar} onClose={() => setSelectedCar(null)} />
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Хлебные крошки */}
        <nav className="flex items-center gap-2 text-[13px] text-text-secondary mb-6" aria-label="Хлебные крошки">
          <a href="/" className="hover:text-text-primary transition-colors duration-200 cursor-pointer">
            Главная
          </a>
          <span className="text-text-muted" aria-hidden="true">/</span>
          <span className="text-text-primary">Каталог</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Каталог автомобилей</h1>
          <p className="text-[14px] text-text-secondary mt-1">
            {totalAvailable.toLocaleString("ru-RU")} автомобилей в каталоге
          </p>
        </div>

        {/* ── Desktop filter bar (lg+) ───────────────────────────────────── */}
        <div className="hidden lg:block sticky top-[calc(4rem+33px)] z-30 bg-bg-card border border-border rounded-2xl mb-6 shadow-sm">
          {/* Строка 1: Тип авто + счётчик + сортировка */}
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-border">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateFilters({ carType: "" })}
                className={`${PILL_BASE} ${filters.carType === "" ? PILL_ACTIVE : PILL_INACTIVE}`}
              >
                Все
              </button>
              {Object.entries(CAR_TYPE_LABELS).map(([slug, label]) => (
                <button
                  key={slug}
                  onClick={() => updateFilters({ carType: filters.carType === slug ? "" : slug })}
                  className={`${PILL_BASE} ${filters.carType === slug ? PILL_ACTIVE : PILL_INACTIVE}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[13px] text-text-muted whitespace-nowrap">
                {filtered.length} авто
                {bookedCount > 0 && <span className="text-text-muted/70"> ({bookedCount} забронировано)</span>}
              </span>
              <select
                value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value as SortValue })}
                className="h-9 px-3 bg-white border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent transition-colors duration-200 cursor-pointer appearance-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Строка 2: Марки + Топливо + КПП */}
          {!panelProps.hideBrandFilter && (
            <div className="px-5 py-3 border-b border-border">
              <div className="flex items-start gap-3 flex-wrap">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium shrink-0 mt-1.5">Марка</span>
                <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-hidden">
                  {availableBrands.slice(0, 12).map(({ slug, label, count }) => (
                    <button
                      key={slug}
                      onClick={() => updateFilters({ brand: filters.brand === slug ? "" : slug })}
                      className={`${PILL_BASE} ${filters.brand === slug ? PILL_ACTIVE : PILL_INACTIVE}`}
                    >
                      {label}
                      <span className={`ml-1 text-[11px] ${filters.brand === slug ? "text-white/70" : "text-text-muted"}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                  {availableBrands.length > 12 && (
                    <button
                      onClick={() => setAdvancedOpen(true)}
                      className={`${PILL_BASE} ${PILL_INACTIVE}`}
                    >
                      Ещё {availableBrands.length - 12}
                    </button>
                  )}
                </div>

                <div className="h-6 w-px bg-border shrink-0 mx-1 self-center" />
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium shrink-0 self-center">Топливо</span>
                <div className="flex gap-1.5 flex-wrap self-center">
                  {Object.entries(FUEL_FILTER_LABELS).map(([slug, label]) => (
                    <button
                      key={slug}
                      onClick={() => updateFilters({ fuel: filters.fuel === slug ? "" : slug })}
                      className={`${PILL_BASE} ${filters.fuel === slug ? PILL_ACTIVE : PILL_INACTIVE}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-border shrink-0 mx-1 self-center" />
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium shrink-0 self-center">КПП</span>
                <div className="flex gap-1.5 self-center">
                  {Object.entries(TRANSMISSION_FILTER_LABELS).map(([slug, label]) => (
                    <button
                      key={slug}
                      onClick={() => updateFilters({ transmission: filters.transmission === slug ? "" : slug })}
                      className={`${PILL_BASE} ${filters.transmission === slug ? PILL_ACTIVE : PILL_INACTIVE}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Строка 3: Расширенные фильтры (год, пробег, цена) — toggle */}
          <div>
            <button
              onClick={() => setAdvancedOpen((v) => !v)}
              className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-pointer w-full text-left"
              aria-expanded={advancedOpen}
            >
              <IconFilter />
              Ещё фильтры
              {hasActiveFilters && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 bg-accent text-white text-[11px] rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <span className="ml-auto">
                <IconChevron open={advancedOpen} />
              </span>
            </button>

            {advancedOpen && (
              <div className="px-5 py-3 border-t border-border bg-bg-surface/50">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-text-muted">Год от</span>
                    <select
                      value={filters.yearMin}
                      onChange={(e) => updateFilters({ yearMin: e.target.value })}
                      className="h-9 px-2 bg-white border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent cursor-pointer appearance-none"
                    >
                      <option value="">—</option>
                      {YEAR_OPTIONS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                    <span className="text-[12px] text-text-muted">до</span>
                    <select
                      value={filters.yearMax}
                      onChange={(e) => updateFilters({ yearMax: e.target.value })}
                      className="h-9 px-2 bg-white border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent cursor-pointer appearance-none"
                    >
                      <option value="">—</option>
                      {YEAR_OPTIONS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-text-muted">Пробег до</span>
                    <select
                      value={filters.mileageMax}
                      onChange={(e) => updateFilters({ mileageMax: e.target.value })}
                      className="h-9 px-2 bg-white border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent cursor-pointer appearance-none"
                    >
                      <option value="">Любой</option>
                      {MILEAGE_OPTIONS.map((opt) => <option key={opt.value} value={String(opt.value)}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-text-muted">Цена до</span>
                    <select
                      value={filters.priceMax}
                      onChange={(e) => updateFilters({ priceMax: e.target.value })}
                      className="h-9 px-2 bg-white border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent cursor-pointer appearance-none"
                    >
                      <option value="">Любая</option>
                      {PRICE_OPTIONS.map((opt) => <option key={opt.manWon} value={String(opt.manWon)}>{opt.label}</option>)}
                    </select>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="h-9 px-3 text-[12px] text-text-secondary border border-border rounded-lg hover:border-border-hover hover:text-text-primary transition-colors duration-200 cursor-pointer"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active chips (desktop) */}
        {hasActiveFilters && (
          <div className="hidden lg:block mb-4">
            <ActiveChips filters={filters} onRemove={removeFilter} />
          </div>
        )}

        {/* ── Mobile sticky bar (< lg) ──────────────────────────────────── */}
        <div className="lg:hidden sticky top-[calc(4rem+33px)] z-30 bg-white border border-border rounded-xl shadow-sm mb-5">
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 h-10 px-4 text-[13px] font-medium text-text-secondary bg-bg-surface border border-border rounded-lg cursor-pointer"
            >
              <IconFilter />
              Фильтры
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-accent text-white text-[11px] rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as SortValue })}
              className="flex-1 min-w-0 h-10 px-3 bg-bg-surface border border-border rounded-lg text-[13px] text-text-primary cursor-pointer appearance-none focus:outline-none focus:border-accent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="text-[12px] text-text-muted whitespace-nowrap shrink-0">
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Active chips (mobile) */}
        {hasActiveFilters && (
          <div className="lg:hidden mb-4">
            <ActiveChips filters={filters} onRemove={removeFilter} />
          </div>
        )}

        {/* Сетка карточек */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-text-secondary">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto mb-4 text-text-muted"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-[16px] font-medium text-text-primary">Автомобили не найдены</p>
            <p className="text-[14px] mt-2 max-w-sm mx-auto">
              Попробуйте изменить фильтры или оставьте заявку — мы подберём авто по вашим параметрам.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 h-10 px-5 bg-accent hover:bg-accent-hover text-white text-[14px] font-medium rounded-xl transition-colors duration-200 cursor-pointer"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {buildGrid()}
            </div>
            {hasMore && (
              <div ref={loadMoreRef} className="text-center py-8">
                <p className="text-[13px] text-text-muted">
                  Показано {visibleCount} из {filtered.length} &middot; Скролльте для загрузки
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
              <h3 className="text-[16px] font-semibold text-text-primary">Фильтры</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-border cursor-pointer"
                aria-label="Закрыть"
              >
                <IconClose size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Тип авто */}
              <div>
                <p className="text-[12px] uppercase tracking-wider text-text-muted font-medium mb-2">Тип</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateFilters({ carType: "" })}
                    className={`${PILL_BASE} h-10 ${filters.carType === "" ? PILL_ACTIVE : PILL_INACTIVE}`}
                  >
                    Все
                  </button>
                  {Object.entries(CAR_TYPE_LABELS).map(([slug, label]) => (
                    <button
                      key={slug}
                      onClick={() => updateFilters({ carType: filters.carType === slug ? "" : slug })}
                      className={`${PILL_BASE} h-10 ${filters.carType === slug ? PILL_ACTIVE : PILL_INACTIVE}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <FilterPanelContent {...panelProps} />
            </div>

            {/* Sticky footer */}
            <div
              className="border-t border-border px-5 py-4 flex gap-3"
              style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
            >
              <button
                onClick={resetFilters}
                className="h-12 px-5 border border-border rounded-xl text-[14px] text-text-secondary cursor-pointer hover:border-border-hover transition-colors duration-200"
              >
                Сбросить
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 h-12 bg-cta hover:bg-cta-hover text-white text-[15px] font-semibold rounded-xl cursor-pointer transition-colors duration-200"
              >
                Показать {filtered.length} авто
              </button>
            </div>
          </div>
        </div>
      )}

      <LeadForm car={selectedCar} onClose={() => setSelectedCar(null)} />
    </>
  );
}
