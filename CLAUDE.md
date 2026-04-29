# Encar Parser

Encar.com data parser, file-backed JSON car store, and Russian-language Next.js catalog (`encar-korea`) for importing Korean used cars to Russia. Two runnable surfaces: a Python CLI (`encar_parser.py` + `run.py`) for ad-hoc JSON/CSV exports, and a Next.js 16 app under `web/` that serves the catalog, brand/filter pages, lead form, sitemap, and sync scripts.

**Stack:** Node.js · Next.js 16 / React 19 · TypeScript · Tailwind 4 · Python (`requests`, `fake-useragent`) · local JSON files · PM2

> Auto-generated from `wiki/`. Edit the wiki, not this file. Manual edits are overwritten on next derive.

## Critical invariants

Violating any of these causes data loss, downtime, or silent corruption. Read before every code change.

1. **Run web app from `web/` working dir.** PM2 sets `cwd` to `web/`; `car-store.ts` reads `data/db/cars.json` and `data/cache/cars.json` relative to `process.cwd()`; lead route writes `data/leads.jsonl` the same way (`web/ecosystem.config.cjs:8`, `web/src/lib/car-store.ts:7`, `web/src/app/api/lead/route.ts:5`).
2. **Don't change DB record shape in isolation.** `web/scripts/sync-cars.ts`, `web/scripts/rebuild-db-from-cache.ts`, and `web/src/lib/car-store.ts` must agree on `status`, `bookedAt`, and `parsed` shapes (`web/src/lib/car-store.ts:17`, `web/scripts/sync-cars.ts:41`, `web/scripts/rebuild-db-from-cache.ts:22`).
3. **JSON writes are not atomic.** `sync-cars.ts`, `seed-cache.ts`, `rebuild-db-from-cache.ts` use `writeFileSync` directly; a kill mid-write truncates the file and `car-store.ts` then returns an empty catalog (`web/scripts/sync-cars.ts:195`, `web/scripts/seed-cache.ts:66`, `web/scripts/rebuild-db-from-cache.ts:34`, `web/src/lib/car-store.ts:74`). Use temp-file + rename.
4. **`booked` ≠ confirmed sale.** Sync infers it from listings disappearing from Encar, capped at `BOOKED_RATIO=0.06`, `MAX_BOOKED=30`, `BOOKED_TTL_H=24` (`web/scripts/sync-cars.ts:36`, `web/scripts/sync-cars.ts:37`, `web/scripts/sync-cars.ts:38`, `web/scripts/sync-cars.ts:277`).
5. **Don't add a second Next instance.** Lead writes are synchronous appends to one file and the in-process car-store cache is process-local; ADR-009 keeps deployment to one forked Next process on port 3850 (`web/ecosystem.config.cjs:13`, `web/ecosystem.config.cjs:14`).
6. **Currency rates are duplicated.** `KRW_TO_RUB=0.063` lives in `web/src/lib/encar-api.ts:6`, `web/scripts/sync-cars.ts:91`, and `web/scripts/seed-cache.ts:69` — change all three together or prices drift between live, synced, and seeded data.
7. **Lead endpoint is unauthenticated and rate-limit-free.** `POST /api/lead` only requires `name` + `phone` and `appendFileSync`s the body to `data/leads.jsonl` — gate behind a rate limit before exposing publicly (`web/src/app/api/lead/route.ts:14`, `web/src/app/api/lead/route.ts:38`).

Full ADRs: [wiki/decisions.md](wiki/decisions.md) (9)
Full sharp edges: [wiki/gotchas.md](wiki/gotchas.md) (3 critical, 4 high)

## Verify changes

```bash
cd /home/ubuntu/apps/encar-parser/web
npm install                                # installs Next 16, React 19, Tailwind 4 (web/package.json:14-25)
npm run build                              # next build (web/package.json:7) — must pass before restart
pm2 restart encar-korea                    # one forked process on port 3850 (web/ecosystem.config.cjs:13)
curl -s http://127.0.0.1:3850/api/cars?limit=1 | head    # { cars, total } or JSON error (web/src/app/api/cars/route.ts:10)
curl -s http://127.0.0.1:3850/api/sitemap-xml | head     # Content-Type application/xml (web/src/app/api/sitemap-xml/route.ts:25)
npm run rebuild-db                         # rebuild data/db/cars.json from data/cache/cars.json
```

No automated test suite is declared — `web/package.json` has `dev`, `build`, `start`, `rebuild-db` only (`wiki/gotchas.md` "No automated tests are declared"). Manually exercise `/`, `/catalog`, a brand page, a detail page, `/api/cars`, `/api/lead` after changes.

## Code style

- TypeScript strict mode is on (`web/tsconfig.json:11`); pages and routes use App Router conventions.
- Server reads through `car-store.ts` (`server-only`); never import it from client components.
- `CarListing` is the canonical web shape — owned by `web/src/lib/encar-api.ts:121`. Update it together with parser mapping, store assumptions, catalog cards, detail specs, lead payloads, and JSON-LD generators.
- Client filtering operates only on the `initialCars` payload the server passed in (`web/src/app/catalog/catalog-client.tsx:114`); don't promise full-corpus filters from the client.
- Errors in store and live fetch return empty results, not throws (`web/src/lib/car-store.ts:74`, `web/src/lib/encar-api.ts:370`). Log failures with the file path before swallowing.

## Project map

```
encar-parser/
├── encar_parser.py            # Python parser library (Encar query, paging, mapping, JSON/CSV export)
├── run.py                     # Python CLI — wires args into EncarParser.parse()
├── requirements.txt           # requests, fake-useragent
└── web/                       # Next.js 16 app, PM2-managed (encar-korea)
    ├── ecosystem.config.cjs   # one forked Next process, port 3850, cwd=web/
    ├── next.config.ts         # remotePatterns: ci.encar.com
    ├── package.json           # dev/build/start on 3850, rebuild-db
    ├── scripts/
    │   ├── sync-cars.ts       # batch import (MAX_TOTAL=20000, BATCH_SIZE=50, 75% Y / 25% N)
    │   ├── seed-cache.ts      # initial Encar fetch into data/cache
    │   └── rebuild-db-from-cache.ts
    ├── data/
    │   ├── db/cars.json       # gitignored runtime DB (status: active|booked, bookedAt)
    │   ├── cache/cars.json    # cache fallback for car-store
    │   ├── leads.jsonl        # append-only lead log (PII)
    │   └── sync.log           # cron sync output
    └── src/
        ├── lib/
        │   ├── encar-api.ts   # CarListing, query builder, parser, fetchCars, fetchCarById
        │   ├── car-store.ts   # server-only DB reader, 60s in-memory cache
        │   └── brand-data.ts  # BrandSEO copy + manufacturer taxonomy
        ├── app/
        │   ├── page.tsx                                # home with preview catalog
        │   ├── catalog/page.tsx + catalog-client.tsx   # catalog shell + client filters
        │   ├── catalog/[brand]/page.tsx                # brand landing pages
        │   ├── catalog/[brand]/[carId]/page.tsx        # detail with Vehicle JSON-LD
        │   ├── catalog/(filters)/electric/page.tsx     # SEO filter pages
        │   ├── api/cars/route.ts                       # live Encar proxy, limit cap 200
        │   ├── api/lead/route.ts                       # JSONL append (name+phone required)
        │   ├── api/sitemap-xml/route.ts                # XML sitemap with 1h cache
        │   ├── sitemap-data.ts + robots.ts             # SEO route inventory
        │   └── layout.tsx                              # Organization JSON-LD
        └── components/
            ├── lead-form.tsx, request-section.tsx      # both POST /api/lead
            ├── car-card.tsx, car-gallery.tsx, price-panel.tsx, car-filter.tsx
            └── header.tsx, footer.tsx                  # contain placeholder phone numbers
```

## Key symbols

| Symbol | File | Role |
|---|---|---|
| `CarListing` | `web/src/lib/encar-api.ts:121` | Canonical web-facing car shape (id, slug, prices KRW/RUB, photos, labels). |
| `parseCarFromApi` | `web/src/lib/encar-api.ts:173` | Raw Encar record → `CarListing` (slug, currency, RU labels, photo URLs ≤10). |
| `fetchCars` | `web/src/lib/encar-api.ts:299` | Live Encar fallback, 600s revalidate, returns empty on error. |
| `fetchCarById` | `web/src/lib/encar-api.ts:414` | Detail fallback — searches 500 by brand then 500 globally. |
| `loadDB` (`car-store.ts`) | `web/src/lib/car-store.ts:31` | Cached read of `data/db/cars.json` → `data/cache/cars.json`, 60s TTL. |
| `getCarsWithBooked` | `web/src/lib/car-store.ts:89` | Interleaves bounded booked cars into the active list for display. |
| `sync()` (sync-cars.ts) | `web/scripts/sync-cars.ts:200` | Batch importer, splits Korean(Y) 75% / Imported(N) 25%, writes whole DB. |
| `loadDatabase` | `web/scripts/sync-cars.ts:184` | Returns empty DB on parse failure — preserves nothing of the bad file. |
| `POST /api/lead` | `web/src/app/api/lead/route.ts:8` | Validates name+phone, sync `appendFileSync` to `data/leads.jsonl`. |
| `GET /api/cars` | `web/src/app/api/cars/route.ts:4` | Live proxy with `limit` capped at 200. |
| `getSitemapEntries` | `web/src/app/sitemap-data.ts:79` | Enumerates brand/filter/combo/transmission/price/model routes. |
| `EncarParser.parse()` | `encar_parser.py:212` | Python paging + filter assembly for JSON/CSV export. |

## Tools

GitNexus graph (951 embeddings) is indexed for this project.

- **Before editing any function/method:** `gitnexus_impact({target, direction: "upstream"})` — blast-radius + risk. Warn on HIGH/CRITICAL.
- **Exploring unfamiliar code:** `gitnexus_context({name})` — callers, callees, processes around a symbol.
- **Concept search across files:** `gitnexus_query({query})` — e.g. "lead capture", "booked record", "Encar query builder". Prefer over wide grep.
- **Surface maps:** `gitnexus_route_map`, `gitnexus_tool_map` for HTTP routes / MCP tools in the project.
- **Before commit:** `gitnexus_detect_changes({scope: "staged"})` to verify scope.
- **Renames:** `gitnexus_rename({symbol_name, new_name, dry_run: true})` — preview first, then apply.
- **Stale index warning:** run `npx gitnexus analyze` if any tool reports staleness.

Combine with Serena when GitNexus pointed at a file: `serena.find_symbol(name)` for LSP lookup, `serena.get_symbols_overview(file)` before editing an unfamiliar file, `serena.find_referencing_symbols(name)` for exact callers with `file:line`.

## Wiki protocol

**Always check `wiki/` before answering questions about this project's architecture, patterns, or decisions.**

Every architectural choice, every sharp edge, every in-flight task lives in `wiki/`. The wiki is the single source of truth; this file is a pointer.

### Query order

1. **Wiki semantic search (QMD)** — `qmd query "<concept>" -c encar-parser --no-rerank --json`. **Default first step** for any question about architecture, decisions, gotchas, or how something works. HTTP for tools without shell: `GET http://127.0.0.1:9092/wiki/search/encar-parser?q=...&limit=10&mode=hybrid`. Falls back silently to grep if QMD CLI is missing.
2. **Direct read** — when QMD points to a page, open it for full context (`wiki/decisions.md`, `wiki/gotchas.md`, etc.). The catalog is `wiki/index.md`.
3. **Code graph (GitNexus / Serena)** — for code-level questions ("what calls X", "blast radius of changing Y"): `gitnexus_query`, `gitnexus_impact`, `serena.find_symbol`.
4. **Grep fallback** — `rg -n "<term>" wiki/` when QMD/graph unavailable.
5. **Code last** — only for line-level details the wiki didn't cover.

### Wiki pages

- [overview.md](wiki/overview.md) — project overview, stack, quick start
- [architecture.md](wiki/architecture.md) — high-level structure, data flows
- [decisions.md](wiki/decisions.md) — ADRs with commit evidence
- [gotchas.md](wiki/gotchas.md) — sharp edges (Critical / High / Medium / Low)
- [active-areas.md](wiki/active-areas.md) — modules under recent git activity
- [active-tasks.md](wiki/active-tasks.md) — pipeline tasks snapshot
- [deployment.md](wiki/deployment.md) — PM2, sync cron, smoke tests, rollback
- [gaps.md](wiki/gaps.md) — undocumented code, open questions
- [log.md](wiki/log.md) — INIT / INGEST / LINT / DERIVE journal

Every page has YAML frontmatter with `confidence` (high/medium/low) and `sources:` listing `file:line` evidence. Claims without sources are `low` confidence.

### Planning protocol

Before any non-trivial change:

1. Query wiki — start with `wiki/index.md`, then relevant pages. If graph tools are available (see Tools), use `gitnexus_query` / `gitnexus_impact` for blast-radius before edits.
2. Synthesize "Past Knowledge": relevant decisions / applicable patterns / known gotchas / reusable components
3. Check `/home/ubuntu/wiki-master/` for cross-project patterns
4. Only then plan

Bug fixes too — `gotchas.md` often names the exact bug you're about to re-encounter.

### Save-on-session-end

After non-trivial work (feature, bug fix, refactor):

1. **Update touched wiki pages** — if behavior documented in `components/*.md` or `decisions.md` changed, update; `sources:` must still resolve to `file:line`
2. **Append to `wiki/log.md`** — timestamp, what was done, pages touched, new gaps
3. **Log new gaps** to `wiki/gaps.md`
4. **Flag cross-project patterns** — reusable finds go under `## cross-project candidates` in `gaps.md`

Trivial sessions (typo, one-liner) skip this.

### Wiki update flow

Wiki re-derives automatically:
- After every successful dev-orchestrator task (INGEST on the task diff)
- WikiFreshness scheduler (~5 min, scans worktree + committed changes)
- Nightly LINT (24h full audit)

Manual triggers when you want to commit fresh wiki right away:
- `POST http://127.0.0.1:9092/wiki/ingest/encar-parser?diffMode=worktree` — uncommitted changes
- `POST http://127.0.0.1:9092/wiki/ingest/encar-parser?diffMode=committed` — new commits since last ingest
- `POST http://127.0.0.1:9092/entity/wiki/encar-parser` — full INIT rewrite (~10 min)

Pipeline runs: wiki updater → QMD re-embed → re-derives this CLAUDE.md / PROJECT.md / README.md.
**Never edit derived files manually** — they get overwritten on next derive. Edit `wiki/` instead.

### Master wiki

`/home/ubuntu/wiki-master/` — cross-project knowledge.

- `project-summaries/` — overview.md from each project (v1, live)
- `patterns.md` / `learnings.md` / `conventions.md` / `tech-debt.md` — v2, not yet generated

Sync runs automatically on every wiki change.

## Behavioral principles

**At the start of any non-trivial task, load `Skill("karpathy-guidelines")`** — the skill is mandatory reading, not optional. It carries the full text and worked examples for the 4 rules below.

1. **Think Before Coding** — surface assumptions, ask when unclear, don't pick silently.
2. **Simplicity First** — minimum code for the ask, no speculative abstractions, no impossible-scenario error handling.
3. **Surgical Changes** — touch only what you must; don't "improve" adjacent code; match existing style.
4. **Goal-Driven Execution** — turn tasks into verifiable goals, plan multi-step work with checkpoints.

Trivial edits (typo, one-liner) skip the skill load — judgment applies.

## Derive lineage

Built from:
- `wiki/index.md`, `wiki/overview.md`, `wiki/architecture.md`, `wiki/decisions.md`, `wiki/gotchas.md`, `wiki/active-tasks.md`, `wiki/active-areas.md`, `wiki/gaps.md`, `wiki/deployment.md`

Derive date: `2026-04-29` · snapshot: `9e501cd9`
