#!/usr/bin/env npx tsx
/**
 * Мягкий синхронизатор авто из encar.com API.
 *
 * Стратегия:
 * 1. Загружает авто порциями по 50 с задержкой 3-5 сек (рандом)
 * 2. Сравнивает с текущей базой
 * 3. Новые авто → status: "active"
 * 4. Пропавшие из API → status: "booked" + bookedAt
 * 5. Забронированные >24ч → удаляются из базы
 *
 * Запуск: npx tsx scripts/sync-cars.ts
 * Cron:   0 3 * * * cd /home/ubuntu/apps/encar-parser/web && npx tsx scripts/sync-cars.ts >> data/sync.log 2>&1
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const API = "https://api.encar.com/search/car/list/premium";
const HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  Referer: "https://www.encar.com/",
};

const DB_DIR = join(process.cwd(), "data", "db");
const DB_FILE = join(DB_DIR, "cars.json");
const LOG_PREFIX = () => `[${new Date().toISOString().slice(0, 19)}]`;

// ── Конфигурация ──
const BATCH_SIZE = 50;
const MAX_TOTAL = 20000;       // макс авто для загрузки (первые N по дате обновления)
const DELAY_MIN_MS = 2000;     // мин задержка между запросами
const DELAY_MAX_MS = 4000;     // макс задержка
const BOOKED_TTL_H = 24;       // через сколько часов удалять "забронированные"
const BOOKED_RATIO = 0.06;     // ~6% авто будут помечены как "забронировано" (из удалённых)
const MAX_BOOKED = 30;         // максимум "забронированных" в базе

// ── Типы ──
interface CarRecord {
  id: string;
  status: "active" | "booked";
  bookedAt?: string;
  data: Record<string, unknown>;
  parsed: ParsedCar;
}

interface ParsedCar {
  id: string;
  slug: string;
  manufacturer: string;
  manufacturerKey: string;
  model: string;
  badge: string;
  badgeDetail: string;
  year: number;
  formYear: string;
  priceMan: number;
  priceKRW: number;
  priceRUB: number;
  mileageKm: number;
  fuelType: string;
  fuelTypeRu: string;
  transmission: string;
  transmissionRu: string;
  sellType: string;
  officeCity: string;
  officeName: string;
  dealerName: string;
  modifiedDate: string;
  photoUrl: string;
  photos: string[];
  detailUrl: string;
  trust: string[];
  condition: string[];
  // Парсим из badge
  displacement: string;   // "1.6", "2.0", "3.8"
  driveType: string;      // "2WD", "4WD", ""
  isTurbo: boolean;
  serviceMark: string[];  // ["EncarMeetgo", "EncarDiagnosisP1"]
}

interface Database {
  lastSync: string;
  totalOnEncar: number;
  syncDurationSec: number;
  cars: CarRecord[];
}

// ── Маппинги ──
const PHOTO_BASE = "https://ci.encar.com";
const DETAIL_URL = "https://www.encar.com/dc/dc_cardetailview.do?carid=";
const KRW_TO_RUB = 0.063;

const KOREAN_TO_SLUG: Record<string, string> = {
  "현대": "hyundai", "기아": "kia", "제네시스": "genesis",
  "쉐보레(GM대우)": "chevrolet", "KG모빌리티(쌍용)": "ssangyong",
  "르노코리아(삼성)": "renault", "BMW": "bmw", "벤츠": "mercedes",
  "Audi": "audi", "폭스바겐": "volkswagen", "도요타": "toyota",
  "혼다": "honda", "볼보": "volvo", "포르쉐": "porsche",
  "테슬라": "tesla", "렉서스": "lexus",
};

const FUEL_LABELS: Record<string, string> = {
  "가솔린": "Бензин", "디젤": "Дизель", "LPG": "LPG",
  "가솔린+전기": "Гибрид", "전기": "Электро", "LPG+전기": "LPG гибрид",
  "LPG(일반인 구입)": "LPG",
};

const TRANS_LABELS: Record<string, string> = {
  "오토": "АКПП", "수동": "МКПП", "CVT": "Вариатор",
};

// ── Утилиты ──
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
}

function log(...args: unknown[]): void {
  console.log(LOG_PREFIX(), ...args);
}

function parseCar(raw: Record<string, unknown>): ParsedCar {
  const id = String(raw.Id ?? "");
  const yearRaw = Number(raw.Year ?? 0);
  const year = yearRaw ? Math.floor(yearRaw / 100) : 0;
  const priceMan = Number(raw.Price ?? 0);
  const priceKRW = priceMan * 10000;
  const manufacturer = String(raw.Manufacturer ?? "");
  const model = String(raw.Model ?? "");
  const fuelType = String(raw.FuelType ?? "");
  const transmission = String(raw.Transmission ?? "");
  const photoPath = String(raw.Photo ?? "");

  const photosRaw = (raw.Photos as { location: string; ordering: number }[]) ?? [];
  const photos = photosRaw
    .sort((a, b) => a.ordering - b.ordering)
    .map((p) => `${PHOTO_BASE}${p.location}`)
    .slice(0, 10);

  const modelSlug = model.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return {
    id,
    slug: `${id}-${modelSlug}-${year}`,
    manufacturer,
    manufacturerKey: KOREAN_TO_SLUG[manufacturer] ?? "",
    model,
    badge: String(raw.Badge ?? ""),
    badgeDetail: String(raw.BadgeDetail ?? ""),
    year,
    formYear: String(raw.FormYear ?? ""),
    priceMan,
    priceKRW,
    priceRUB: Math.round(priceKRW * KRW_TO_RUB),
    mileageKm: Number(raw.Mileage ?? 0),
    fuelType,
    fuelTypeRu: FUEL_LABELS[fuelType] ?? fuelType,
    transmission,
    transmissionRu: TRANS_LABELS[transmission] ?? transmission,
    sellType: String(raw.SellType ?? ""),
    officeCity: String(raw.OfficeCityState ?? ""),
    officeName: String(raw.OfficeName ?? ""),
    dealerName: String(raw.DealerName ?? ""),
    modifiedDate: String(raw.ModifiedDate ?? ""),
    photoUrl: photoPath ? `${PHOTO_BASE}${photoPath}001.jpg` : "",
    photos: photos.length ? photos : (photoPath ? [`${PHOTO_BASE}${photoPath}001.jpg`] : []),
    detailUrl: `${DETAIL_URL}${id}`,
    trust: (raw.Trust as string[]) ?? [],
    condition: (raw.Condition as string[]) ?? [],
    // Парсим из badge
    displacement: (String(raw.Badge ?? "").match(/(\d+\.\d+)/) ?? [])[1] ?? "",
    driveType: /4WD|AWD/i.test(String(raw.Badge ?? "")) ? "4WD" : /2WD/i.test(String(raw.Badge ?? "")) ? "2WD" : "",
    isTurbo: /터보|turbo/i.test(String(raw.Badge ?? "")),
    serviceMark: (raw.ServiceMark as string[]) ?? [],
  };
}

function loadDatabase(): Database {
  try {
    if (existsSync(DB_FILE)) {
      return JSON.parse(readFileSync(DB_FILE, "utf-8"));
    }
  } catch (e) {
    log("WARNING: Failed to read existing database, starting fresh");
  }
  return { lastSync: "", totalOnEncar: 0, syncDurationSec: 0, cars: [] };
}

function saveDatabase(db: Database): void {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(db), "utf-8");
}

// ── Основной синхронизатор ──
async function sync(): Promise<void> {
  const startTime = Date.now();
  log("=== Начинаем синхронизацию ===");

  const db = loadDatabase();
  const oldIds = new Set(db.cars.filter((c) => c.status === "active").map((c) => c.id));

  log(`В базе: ${db.cars.length} авто (${db.cars.filter(c => c.status === "active").length} активных, ${db.cars.filter(c => c.status === "booked").length} забронированных)`);

  // 1. Загружаем свежие данные из API (корейские + импортные)
  const freshItems: Record<string, unknown>[] = [];
  let totalOnEncar = 0;
  let consecutiveErrors = 0;

  // Качаем оба типа: Y=корейские (основная масса), N=импортные (BMW, Mercedes и т.д.)
  const CAR_TYPES = [
    { type: "Y", limit: Math.floor(MAX_TOTAL * 0.75) },  // 75% — корейские
    { type: "N", limit: Math.floor(MAX_TOTAL * 0.25) },  // 25% — импортные
  ];

  for (const { type: carType, limit: typeLimit } of CAR_TYPES) {
    log(`--- Загружаем CarType=${carType} (лимит ${typeLimit}) ---`);
    consecutiveErrors = 0;

    for (let offset = 0; offset < typeLimit; offset += BATCH_SIZE) {
    const q = `(And.Hidden.N._.CarType.${carType}.)`;
    const sr = `|ModifiedDate|${offset}|${BATCH_SIZE}`;
    const url = `${API}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;

    try {
      const resp = await fetch(url, { headers: HEADERS });

      if (!resp.ok) {
        consecutiveErrors++;
        log(`API error: ${resp.status} at offset ${offset}`);
        if (consecutiveErrors >= 3) {
          log("3 ошибки подряд — останавливаем загрузку");
          break;
        }
        await sleep(randomDelay() * 2); // двойная задержка при ошибке
        continue;
      }

      consecutiveErrors = 0;
      const data = await resp.json();
      const results = (data.SearchResults ?? []) as Record<string, unknown>[];
      totalOnEncar = Number(data.Count ?? 0);

      freshItems.push(...results);
      log(`Загружено: ${freshItems.length}/${Math.min(MAX_TOTAL, totalOnEncar)} (offset ${offset})`);

      if (results.length < BATCH_SIZE) break;
      if (offset + BATCH_SIZE < typeLimit) {
        await sleep(randomDelay());
      }
    } catch (err) {
      consecutiveErrors++;
      log(`Fetch error at offset ${offset}:`, (err as Error).message);
      if (consecutiveErrors >= 3) break;
      await sleep(randomDelay() * 2);
    }
  }
  } // end CAR_TYPES loop

  if (freshItems.length === 0) {
    log("Не удалось загрузить ни одного авто. Сохраняем текущую базу.");
    // Всё равно чистим старые booked
    cleanupBooked(db);
    saveDatabase(db);
    return;
  }

  // 2. Парсим и создаём Set свежих ID
  const freshParsed = freshItems.map(parseCar);
  const freshIds = new Set(freshParsed.map((c) => c.id));

  // 3. Определяем пропавшие авто (были active, нет в API) → booked
  const disappeared = db.cars
    .filter((c) => c.status === "active" && !freshIds.has(c.id))
    .slice(0, Math.ceil(freshParsed.length * BOOKED_RATIO)); // ограничиваем кол-во

  const now = new Date().toISOString();
  const newBookedRecords: CarRecord[] = disappeared
    .slice(0, MAX_BOOKED)
    .map((c) => ({
      ...c,
      status: "booked" as const,
      bookedAt: now,
    }));

  // 4. Собираем новую базу
  const activeRecords: CarRecord[] = freshParsed.map((parsed) => ({
    id: parsed.id,
    status: "active" as const,
    data: freshItems.find((r) => String(r.Id) === parsed.id) ?? {},
    parsed,
  }));

  // Сохраняем старые booked (если не истекли)
  const existingBooked = db.cars
    .filter((c) => c.status === "booked" && c.bookedAt)
    .filter((c) => {
      const age = Date.now() - new Date(c.bookedAt!).getTime();
      return age < BOOKED_TTL_H * 60 * 60 * 1000;
    })
    .filter((c) => !freshIds.has(c.id)); // не дублировать с active

  const allBooked = [...existingBooked, ...newBookedRecords]
    .slice(0, MAX_BOOKED);

  const newDb: Database = {
    lastSync: now,
    totalOnEncar: totalOnEncar || db.totalOnEncar,
    syncDurationSec: Math.round((Date.now() - startTime) / 1000),
    cars: [...activeRecords, ...allBooked],
  };

  saveDatabase(newDb);

  const newCount = freshParsed.filter((c) => !oldIds.has(c.id)).length;
  log(`=== Синхронизация завершена ===`);
  log(`  Активных: ${activeRecords.length}`);
  log(`  Забронированных: ${allBooked.length}`);
  log(`  Новых с прошлого раза: ${newCount}`);
  log(`  Пропавших → забронировано: ${newBookedRecords.length}`);
  log(`  Время: ${newDb.syncDurationSec} сек`);
  log(`  Всего на encar: ${totalOnEncar}`);
}

function cleanupBooked(db: Database): void {
  const before = db.cars.length;
  db.cars = db.cars.filter((c) => {
    if (c.status !== "booked" || !c.bookedAt) return true;
    const age = Date.now() - new Date(c.bookedAt).getTime();
    return age < BOOKED_TTL_H * 60 * 60 * 1000;
  });
  const removed = before - db.cars.length;
  if (removed > 0) log(`Удалено ${removed} просроченных "забронированных"`);
}

sync().catch((err) => {
  log("FATAL:", err);
  process.exit(1);
});
