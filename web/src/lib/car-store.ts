import "server-only";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { CarListing, BrandStats } from "./encar-api";
import { MANUFACTURER_LABELS } from "./encar-api";

const DB_FILE = join(process.cwd(), "data", "db", "cars.json");
const CACHE_FILE = join(process.cwd(), "data", "cache", "cars.json");

export type CarStatus = "active" | "booked";

export interface StoreCar extends CarListing {
  status: CarStatus;
  bookedAt?: string;
}

interface DatabaseRecord {
  id: string;
  status: CarStatus;
  bookedAt?: string;
  parsed: CarListing;
}

interface Database {
  lastSync: string;
  totalOnEncar: number;
  syncDurationSec: number;
  cars: DatabaseRecord[];
}

let _cache: { db: Database; loadedAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 мин in-memory кэш

function loadDB(): Database {
  // In-memory кэш чтобы не читать файл на каждый запрос
  if (_cache && Date.now() - _cache.loadedAt < CACHE_TTL_MS) {
    return _cache.db;
  }

  try {
    if (!existsSync(DB_FILE)) {
      if (existsSync(CACHE_FILE)) {
        const cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as {
          timestamp?: number;
          total?: number;
          cars?: CarListing[];
        };

        const cars = (cache.cars ?? []).map((parsed) => ({
          ...parsed,
          status: "active" as CarStatus,
        }));

        const fallback: Database = {
          lastSync: cache.timestamp ? new Date(cache.timestamp).toISOString() : "",
          totalOnEncar: Number(cache.total ?? cars.length ?? 0),
          syncDurationSec: 0,
          cars: cars.map((car) => ({
            id: car.id,
            status: car.status,
            parsed: car,
          })),
        };

        _cache = { db: fallback, loadedAt: Date.now() };
        return fallback;
      }

      return { lastSync: "", totalOnEncar: 0, syncDurationSec: 0, cars: [] };
    }
    const db = JSON.parse(readFileSync(DB_FILE, "utf-8")) as Database;
    _cache = { db, loadedAt: Date.now() };
    return db;
  } catch {
    return { lastSync: "", totalOnEncar: 0, syncDurationSec: 0, cars: [] };
  }
}

/** Все авто из локальной БД (active + booked) */
export function getAllCars(): StoreCar[] {
  const db = loadDB();
  return db.cars.map((r) => ({
    ...r.parsed,
    status: r.status,
    bookedAt: r.bookedAt,
  }));
}

/** Только активные авто */
export function getActiveCars(): StoreCar[] {
  return getAllCars().filter((c) => c.status === "active");
}

/** Авто с забронированными, перемешанные для естественного вида */
export function getCarsWithBooked(limit?: number): StoreCar[] {
  const all = getAllCars();
  const active = all.filter((c) => c.status === "active");
  const booked = all.filter((c) => c.status === "booked");

  if (booked.length === 0) {
    return limit ? active.slice(0, limit) : active;
  }

  // Вставляем booked каждые 6-10 active карточек
  const mixed: StoreCar[] = [];
  let bookedIdx = 0;

  for (let i = 0; i < active.length; i++) {
    mixed.push(active[i]);

    // Каждые 7 active карточек вставляем 1 booked
    if ((i + 1) % 7 === 0 && bookedIdx < booked.length) {
      mixed.push(booked[bookedIdx]);
      bookedIdx++;
    }
  }

  // Добавить оставшиеся booked в конец
  while (bookedIdx < booked.length) {
    mixed.push(booked[bookedIdx]);
    bookedIdx++;
  }

  return limit ? mixed.slice(0, limit) : mixed;
}

/** Авто по марке */
export function getCarsByBrand(brandSlug: string): StoreCar[] {
  return getCarsWithBooked().filter((c) => c.manufacturerKey === brandSlug);
}

/** Найти авто по ID */
export function getCarById(carId: string): StoreCar | null {
  const all = getAllCars();
  return all.find((c) => c.id === carId) ?? null;
}

/** Статистика по марке */
export function getBrandStats(brandSlug: string): BrandStats {
  const cars = getAllCars().filter((c) => c.manufacturerKey === brandSlug && c.status === "active");
  const total = cars.length;

  if (total === 0) {
    return { total: 0, cars: [], minPrice: 0, maxPrice: 0, avgPrice: 0, avgMileage: 0, models: [] };
  }

  const prices = cars.map((c) => c.priceRUB).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const avgMileage = Math.round(cars.reduce((acc, c) => acc + c.mileageKm, 0) / total);

  const modelMap = new Map<string, { count: number; prices: number[] }>();
  for (const car of cars) {
    const name = car.model || "Без модели";
    const entry = modelMap.get(name) ?? { count: 0, prices: [] };
    entry.count += 1;
    if (car.priceRUB > 0) entry.prices.push(car.priceRUB);
    modelMap.set(name, entry);
  }

  const models = Array.from(modelMap.entries())
    .map(([name, { count, prices: p }]) => ({
      name,
      count,
      minPrice: p.length ? Math.min(...p) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { total, cars, minPrice, maxPrice, avgPrice, avgMileage, models };
}

/** Общее количество авто на encar (из последнего синка) */
export function getTotalOnEncar(): number {
  return loadDB().totalOnEncar;
}

/** Время последней синхронизации */
export function getLastSync(): string {
  return loadDB().lastSync;
}
