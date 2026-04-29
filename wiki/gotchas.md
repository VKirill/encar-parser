---
title: Gotchas
type: reference
created: 2026-04-29
updated: 2026-04-29
status: active
confidence: medium
tags: [gotchas, troubleshooting, stability, data-loss]
sources:
  - web/src/lib/car-store.ts
  - web/scripts/sync-cars.ts
  - web/scripts/seed-cache.ts
  - web/scripts/rebuild-db-from-cache.ts
  - web/src/lib/encar-api.ts
  - web/src/app/api/lead/route.ts
  - web/src/app/api/cars/route.ts
  - web/src/app/catalog/page.tsx
  - web/src/app/catalog/catalog-client.tsx
  - web/src/app/catalog/[brand]/[carId]/page.tsx
  - web/src/app/page.tsx
  - web/src/components/lead-form.tsx
  - web/src/components/request-section.tsx
  - web/src/components/header.tsx
  - web/src/components/footer.tsx
  - web/ecosystem.config.cjs
  - run.py
  - encar_parser.py
---

# Gotchas

Known problems, edge cases, and landmines in the Encar parser and Next.js catalog. Every entry follows **Problem → Risk → Workaround**.

Read this page before changing file-backed storage, Encar fetching, lead capture, or catalog filtering. The architecture overview explains the container shape in [architecture: C4 Container model](architecture.md#c4-container-model); this page focuses only on failure modes.

```mermaid
flowchart TD
  Encar[Encar API] --> Sync[sync-cars.ts]
  Encar --> Live[fetchCars live fallback]
  Sync --> DB[(data/db/cars.json)]
  Seed[seed-cache.ts] --> Cache[(data/cache/cars.json)]
  Cache --> Store[car-store.ts]
  DB --> Store
  Store --> Pages[Next.js pages]
  Live --> Pages
  Forms[Lead forms] --> LeadAPI[/api/lead]
  LeadAPI --> Leads[(data/leads.jsonl)]

  DB -. corrupt or missing .-> Empty[empty catalog / fallback]
  LeadAPI -. sync append .-> Block[blocked event loop]
```

## Critical — Data Loss / Security

### Sync can overwrite a corrupt DB with a fresh empty-shaped database

**Pattern**: Silent Error Swallowing + Data Loss (Nygard, *Release It!* ch. 4 extension; compare §4.10 Slow Response for hiding failure behind degraded output).

**Problem**: `loadDatabase()` catches any read or parse failure and returns an empty database shape (`web/scripts/sync-cars.ts:184`, `web/scripts/sync-cars.ts:186`, `web/scripts/sync-cars.ts:189`, `web/scripts/sync-cars.ts:192`). Later, `sync()` writes `newDb` to `data/db/cars.json` with `writeFileSync` (`web/scripts/sync-cars.ts:311`, `web/scripts/sync-cars.ts:318`, `web/scripts/sync-cars.ts:195`, `web/scripts/sync-cars.ts:197`).

**Risk**: A malformed or partially written DB file loses its previous `booked` history on the next successful sync. The script logs a warning, but it does not preserve the bad file before writing the replacement (`web/scripts/sync-cars.ts:189`, `web/scripts/sync-cars.ts:190`).

**Workaround**: Before running sync after a crash or disk incident, copy `web/data/db/cars.json` aside. In code, change `loadDatabase()` so parse errors throw, or rename the bad file to `cars.json.corrupt.<timestamp>` before writing a new DB.

### JSON writes are not atomic

**Pattern**: Silent Error Swallowing + Data Loss (Nygard, *Release It!* ch. 4 extension).

**Problem**: The sync script writes `data/db/cars.json` directly with `writeFileSync(DB_FILE, JSON.stringify(db), "utf-8")` (`web/scripts/sync-cars.ts:195`, `web/scripts/sync-cars.ts:197`). Cache seeding writes `raw-api.json` and `cars.json` directly (`web/scripts/seed-cache.ts:66`, `web/scripts/seed-cache.ts:132`). Cache rebuild also writes the DB directly (`web/scripts/rebuild-db-from-cache.ts:33`, `web/scripts/rebuild-db-from-cache.ts:34`).

**Risk**: A process kill, disk-full condition, or host crash during `writeFileSync` can leave a truncated JSON file. `car-store.ts` then catches the parse failure and returns an empty catalog (`web/src/lib/car-store.ts:71`, `web/src/lib/car-store.ts:74`, `web/src/lib/car-store.ts:75`).

**Workaround**: Write to a temp file in the same directory, then rename it over the target. Apply the same pattern to `sync-cars.ts`, `seed-cache.ts`, and `rebuild-db-from-cache.ts`.

```ts
writeFileSync(tmpFile, JSON.stringify(db), "utf-8");
renameSync(tmpFile, DB_FILE);
```

### Lead endpoint can be abused to grow a local PII file

**Pattern**: Users + Unbounded Result Set (Nygard §4.3 and §4.11). User-controlled submissions append to storage without authentication, rate limiting, or size caps.

**Problem**: `POST /api/lead` requires only `name` and `phone`, then appends the entire lead object to `data/leads.jsonl` (`web/src/app/api/lead/route.ts:8`, `web/src/app/api/lead/route.ts:12`, `web/src/app/api/lead/route.ts:14`, `web/src/app/api/lead/route.ts:21`, `web/src/app/api/lead/route.ts:38`). It also stores the forwarding IP header and timestamp (`web/src/app/api/lead/route.ts:30`, `web/src/app/api/lead/route.ts:31`).

**Risk**: A bot can fill the host disk with JSONL lines or create a large PII file. There is no authentication, CAPTCHA, rate limit, body-size guard in the route, or rotation logic in code.

**Workaround**: Add edge or route-level rate limiting before accepting public traffic. Cap field lengths before `appendFileSync`, reject oversized JSON bodies, and rotate or export `data/leads.jsonl` on a schedule.

## High — Infrastructure / Stability

### Batch Encar fetches have no per-request timeout

**Pattern**: Integration Point without timeout (Nygard §4.1). Compounded by Slow Response (§4.10) because a hung integration can look like a long-running sync.

**Problem**: `sync-cars.ts` calls `fetch(url, { headers: HEADERS })` without `AbortSignal.timeout()` (`web/scripts/sync-cars.ts:225`, `web/scripts/sync-cars.ts:228`, `web/scripts/sync-cars.ts:231`). `seed-cache.ts` uses the same no-timeout pattern (`web/scripts/seed-cache.ts:29`, `web/scripts/seed-cache.ts:32`, `web/scripts/seed-cache.ts:36`).

**Risk**: A stuck Encar connection can hang the sync or cache seed process. If this runs from cron, the next run can overlap unless the scheduler or shell wrapper prevents concurrency.

**Workaround**: Wrap all script `fetch()` calls with `AbortSignal.timeout(30_000)` and log timeout failures separately from HTTP status failures. Keep the existing random delay after failed sync requests (`web/scripts/sync-cars.ts:256`, `web/scripts/sync-cars.ts:260`).

### Live page fallback can stampede Encar when the local store is empty

**Pattern**: Dogpile + Integration Point (Nygard §4.8 and §4.1). Many requests can hit the same external API when cache/local data misses.

**Problem**: The home page calls two live `fetchCars()` requests when `getAllCars()` returns empty (`web/src/app/page.tsx:79`, `web/src/app/page.tsx:80`, `web/src/app/page.tsx:86`, `web/src/app/page.tsx:87`, `web/src/app/page.tsx:88`, `web/src/app/page.tsx:89`). The catalog page also calls `fetchCars({ limit: 200 })` when `getCarsWithBooked()` returns empty (`web/src/app/catalog/page.tsx:13`, `web/src/app/catalog/page.tsx:15`, `web/src/app/catalog/page.tsx:16`).

**Risk**: A missing, unreadable, or empty DB can shift user traffic from local file reads to the Encar API. During a restart or fresh deploy, concurrent requests may produce a burst of live third-party calls.

**Workaround**: Keep `data/db/cars.json` populated before routing traffic to the process. Add a startup health check that fails when both DB and cache are empty, or serve a static maintenance state instead of live fallback for high-traffic pages.

### Synchronous lead writes block the Next.js event loop

**Pattern**: Blocked Threads (Nygard §4.4). A synchronous filesystem call runs on the request path.

**Problem**: The lead route imports synchronous filesystem functions and calls `appendFileSync()` inside the async `POST` handler (`web/src/app/api/lead/route.ts:1`, `web/src/app/api/lead/route.ts:2`, `web/src/app/api/lead/route.ts:8`, `web/src/app/api/lead/route.ts:38`). Directory creation also uses synchronous checks and creation (`web/src/app/api/lead/route.ts:35`, `web/src/app/api/lead/route.ts:36`).

**Risk**: Slow disk I/O blocks the single Node event loop. Under lead spam, unrelated page and API requests wait behind filesystem operations.

**Workaround**: Use `fs.promises.appendFile()` and enforce rate limits. For higher traffic, put leads into a real queue or database rather than appending from the request handler.

### `/api/cars` can still trigger large external responses

**Pattern**: Unbounded Result Set, partially mitigated (Nygard §4.11).

**Problem**: `/api/cars` caps `limit` at 200, then proxies the request to `fetchCars({ limit, manufacturer })` (`web/src/app/api/cars/route.ts:4`, `web/src/app/api/cars/route.ts:6`, `web/src/app/api/cars/route.ts:7`, `web/src/app/api/cars/route.ts:10`). `fetchCars()` builds `sr=|sort|0|limit` and maps every returned row into `CarListing` objects (`web/src/lib/encar-api.ts:313`, `web/src/lib/encar-api.ts:349`, `web/src/lib/encar-api.ts:365`, `web/src/lib/encar-api.ts:367`).

**Risk**: The 200-row cap prevents the worst case, but a bot can still force repeated 200-row Encar responses and parsing work. The handler has no rate limit or caching wrapper of its own.

**Workaround**: Add route-level caching or rate limiting. If public API use is not required, remove or protect `/api/cars`; crawlers are already told not to index `/api/` (`web/src/app/robots.ts:8`).

## Medium — Developer Experience

### `car-store.ts` hides parse and read failures as an empty catalog

**Problem**: `loadDB()` wraps DB/cache reads in one `try` block and uses `catch { return { lastSync: "", totalOnEncar: 0, syncDurationSec: 0, cars: [] } }` (`web/src/lib/car-store.ts:34`, `web/src/lib/car-store.ts:40`, `web/src/lib/car-store.ts:71`, `web/src/lib/car-store.ts:74`, `web/src/lib/car-store.ts:75`).

**Risk**: A broken DB, malformed cache, permission error, or path mistake appears as “no cars.” Pages may then fall back to Encar or render empty states, which hides the real local storage problem.

**Workaround**: Log the caught error with the file path before returning an empty store. During debugging, inspect both `web/data/db/cars.json` and `web/data/cache/cars.json` before chasing UI code.

### In-memory store cache stays stale for up to 60 seconds

**Problem**: `car-store.ts` caches the parsed DB in module-level `_cache` and returns it while `Date.now() - loadedAt < CACHE_TTL_MS` (`web/src/lib/car-store.ts:31`, `web/src/lib/car-store.ts:32`, `web/src/lib/car-store.ts:34`, `web/src/lib/car-store.ts:36`, `web/src/lib/car-store.ts:37`).

**Risk**: After running `sync-cars.ts` or `rebuild-db-from-cache.ts`, the Next.js process can serve old inventory for one minute. This is expected, but it looks like the sync did not work.

**Workaround**: Wait at least 60 seconds, restart the Next process, or add an explicit cache invalidation hook after sync if freshness matters.

### Client filters only operate on the initial server payload

**Problem**: `CatalogClient` filters the `initialCars` array in memory; it reads URL params, builds local filter state, then applies predicates to the cars already passed into the component (`web/src/app/catalog/catalog-client.tsx:1`, `web/src/app/catalog/catalog-client.tsx:71`, `web/src/app/catalog/catalog-client.tsx:85`, `web/src/app/catalog/catalog-client.tsx:114`). The catalog route passes either local store cars or a 200-car live fallback (`web/src/app/catalog/page.tsx:15`, `web/src/app/catalog/page.tsx:16`, `web/src/app/catalog/page.tsx:20`).

**Risk**: A filter can show “no results” even if matching cars exist outside the loaded payload. This is especially confusing on fresh checkouts using the 200-car fallback.

**Workaround**: For full-corpus filtering, move filters to a server route that calls `fetchCars()` with filter parameters or query a real database. Until then, treat client filters as filters over the current payload only.

### Detail fallback searches only fixed 500-car windows

**Problem**: `fetchCarById()` states that Encar does not support filtering by ID, so it searches up to 500 cars by brand and then up to 500 cars globally (`web/src/lib/encar-api.ts:414`, `web/src/lib/encar-api.ts:418`, `web/src/lib/encar-api.ts:421`, `web/src/lib/encar-api.ts:422`, `web/src/lib/encar-api.ts:423`, `web/src/lib/encar-api.ts:426`, `web/src/lib/encar-api.ts:427`). The detail page uses that fallback when `getCarById()` misses (`web/src/app/catalog/[brand]/[carId]/page.tsx:38`, `web/src/app/catalog/[brand]/[carId]/page.tsx:39`).

**Risk**: A valid car can render as unavailable if it is not in those search windows. The page then shows the “listing unavailable” state even though the car may still exist deeper in Encar results (`web/src/app/catalog/[brand]/[carId]/page.tsx:47`, `web/src/app/catalog/[brand]/[carId]/page.tsx:52`, `web/src/app/catalog/[brand]/[carId]/page.tsx:53`).

**Workaround**: Prefer local DB lookups for detail pages. If detail accuracy becomes important, persist all synced IDs locally or add a dedicated lookup source instead of relying on 500-row live scans.

### Hardcoded currency rates drift silently

**Problem**: The TypeScript adapter uses fixed constants `KRW_TO_RUB = 0.063` and `KRW_TO_USD = 0.00072` (`web/src/lib/encar-api.ts:6`, `web/src/lib/encar-api.ts:7`, `web/src/lib/encar-api.ts:8`). The sync script separately hardcodes `KRW_TO_RUB = 0.063` (`web/scripts/sync-cars.ts:91`, `web/scripts/sync-cars.ts:94`). Seed cache repeats the same ruble rate (`web/scripts/seed-cache.ts:69`, `web/scripts/seed-cache.ts:70`).

**Risk**: UI prices can drift from current exchange rates. Worse, changing one file and not the others creates inconsistent prices between live fallback, synced DB, and seeded cache.

**Workaround**: Centralize exchange rates in one module or generated config. When adjusting rates now, change `encar-api.ts`, `sync-cars.ts`, and `seed-cache.ts` together, then rebuild or resync local data.

### Rebuild-from-cache can create records with empty IDs

**Problem**: `rebuild-db-from-cache.ts` maps every cached item into a DB record and sets `id: String(parsed.id ?? "")` (`web/scripts/rebuild-db-from-cache.ts:21`, `web/scripts/rebuild-db-from-cache.ts:22`, `web/scripts/rebuild-db-from-cache.ts:26`, `web/scripts/rebuild-db-from-cache.ts:27`). It does not filter out cached rows with missing IDs before writing the DB (`web/scripts/rebuild-db-from-cache.ts:33`, `web/scripts/rebuild-db-from-cache.ts:34`).

**Risk**: Bad cache input can create DB records whose `id` is an empty string. Detail lookups and React keys can behave unpredictably when IDs are missing or duplicated.

**Workaround**: Validate cache rows before mapping. Reject or log any item without a non-empty `id`, and include a count of skipped rows in the rebuild output.

## Low — Annoyances

### Lead form failures are generic for users

**Problem**: `LeadForm` treats any non-OK response as `error` and catches network failures without reading the server error body (`web/src/components/lead-form.tsx:59`, `web/src/components/lead-form.tsx:68`, `web/src/components/lead-form.tsx:71`, `web/src/components/lead-form.tsx:72`). The visible message is one generic retry line (`web/src/components/lead-form.tsx:177`, `web/src/components/lead-form.tsx:178`, `web/src/components/lead-form.tsx:179`). `RequestSection` has the same generic catch pattern (`web/src/components/request-section.tsx:19`, `web/src/components/request-section.tsx:39`).

**Risk**: Users and operators cannot distinguish validation failure, disk write failure, network loss, or server error from the UI alone.

**Workaround**: Read the JSON error body from `/api/lead` and map known cases to user-safe messages. Keep detailed filesystem errors server-side.

### Contact phone placeholders are still in rendered components

**Problem**: Header and footer components contain placeholder phone text `+7 (XXX) XXX-XX-XX` (`web/src/components/header.tsx:94`, `web/src/components/header.tsx:145`, `web/src/components/footer.tsx:99`).

**Risk**: Production pages can show non-callable contact information even while lead forms work. This is easy to miss in code review because the placeholders are static JSX text.

**Workaround**: Replace placeholders with a configured phone number or remove the visible phone until a real number exists. Prefer one shared contact config to avoid updating header and footer separately.

### Python CLI sort choices do not include `Price`

**Problem**: The CLI examples mention sorting by price (`run.py:21`, `run.py:22`), and `EncarParser.parse()` accepts `sort` as a free string (`encar_parser.py:212`, `encar_parser.py:216`). But `argparse` restricts `--sort` to `ModifiedDate`, `Year`, and `Mileage` (`run.py:58`, `run.py:59`, `run.py:60`).

**Risk**: A user following the example `python run.py --sort Price --max 50` gets an argument validation error before the parser runs.

**Workaround**: Add `Price` to the `choices` list in `run.py`, or remove the price-sort example from the CLI docstring.

### No automated tests are declared

**Problem**: `web/package.json` defines `dev`, `build`, `start`, and `rebuild-db`, but no `test` script (`web/package.json:5`, `web/package.json:6`, `web/package.json:7`, `web/package.json:8`, `web/package.json:9`). The Python root has only runtime dependencies, not a test runner (`requirements.txt:1`, `requirements.txt:2`).

**Risk**: Refactors to parser mapping, store shape, client filters, or lead payloads rely on manual checks. The duplicated Python/TypeScript Encar mapping is especially easy to drift.

**Workaround**: At minimum, add fixture-based tests for `parseCarFromApi()`-equivalent mapping and cache/DB rebuild shape. Until then, manually test `/catalog`, a brand page, a detail page, `/api/cars`, and `/api/lead` after changes.

## See also

- [architecture: boundaries for safe changes](architecture.md#boundaries-for-safe-changes) — files to update together.
- [decisions: local JSON files](decisions.md#adr-004-store-synchronized-catalog-data-in-local-json-files-and-ignore-large-db-snapshots) — why file-backed state exists.
- [deployment (planned)](deployment.md) — where to document cron, PM2, logs, and backup routines.

## Backlinks

- [active-areas](./active-areas.md)
- [active-tasks](./active-tasks.md)
- [architecture](./architecture.md)
- [deployment](./deployment.md)
- [gaps](./gaps.md)
- [overview](./overview.md)
