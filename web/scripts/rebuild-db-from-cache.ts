#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const CACHE_FILE = join(process.cwd(), "data", "cache", "cars.json");
const DB_DIR = join(process.cwd(), "data", "db");
const DB_FILE = join(DB_DIR, "cars.json");

function main(): void {
  if (!existsSync(CACHE_FILE)) {
    throw new Error(`Cache file not found: ${CACHE_FILE}`);
  }

  const cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as {
    timestamp?: number;
    total?: number;
    cars?: Array<{ id: string } & Record<string, unknown>>;
  };

  const cars = Array.isArray(cache.cars) ? cache.cars : [];
  const db = {
    lastSync: cache.timestamp ? new Date(cache.timestamp).toISOString() : new Date().toISOString(),
    totalOnEncar: Number(cache.total ?? cars.length),
    syncDurationSec: 0,
    cars: cars.map((parsed) => ({
      id: String(parsed.id ?? ""),
      status: "active",
      parsed,
    })),
  };

  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(db));

  console.log(`[rebuild-db] wrote ${db.cars.length} cars to ${DB_FILE}`);
}

main();
