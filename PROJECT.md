# Encar Parser

Lead-generation catalog of Korean used cars for Russian buyers, plus a Python parser CLI.

> Auto-generated from `wiki/overview.md` and related pages. Edit the wiki, not this file.

## Stack

- **Web app (`web/`, PM2 name `encar-korea`):** Next.js `^16.2.1`, React `^19.2.4`, TypeScript `^6.0.2`, Tailwind `^4.2.2`, `server-only` (`web/package.json:19-25`).
- **Storage:** local JSON files — `data/db/cars.json` (gitignored), `data/cache/cars.json` fallback, `data/leads.jsonl` append-only lead log (`web/src/lib/car-store.ts:7-8`, `.gitignore:12`).
- **Python parser:** `requests`, `fake-useragent` (`requirements.txt:1-2`).
- **Process manager:** PM2, one forked Next process on port `3850` from `cwd=web/` (`web/ecosystem.config.cjs:6-14`).
- **External:** Encar premium search API (`https://api.encar.com/search/car/list/premium`) and Encar image CDN (`ci.encar.com`) (`web/src/lib/encar-api.ts:1-3`, `web/next.config.ts:4-8`).

## Commands

```bash
cd /home/ubuntu/apps/encar-parser/web
npm install
npm run dev                                # next dev on port 3850
npm run build && npm run start             # production build + start
npm run rebuild-db                         # data/cache/cars.json → data/db/cars.json
npx tsx scripts/seed-cache.ts              # initial Encar fetch into data/cache
npx tsx scripts/sync-cars.ts               # batch sync (cron-ready, logs to data/sync.log)
pm2 start ecosystem.config.cjs             # first deploy
pm2 restart encar-korea                    # subsequent deploys
pm2 logs encar-korea
# Python CLI (root):
python run.py --max 50 --sort ModifiedDate --json out.json
```

Cron sync (from `web/scripts/sync-cars.ts:12`):
`0 3 * * * cd /home/ubuntu/apps/encar-parser/web && npx tsx scripts/sync-cars.ts >> data/sync.log 2>&1`

## Architecture

File-backed Next.js catalog with a separate Python export CLI. Production path: `sync-cars.ts` → `data/db/cars.json` → `car-store.ts` (60s in-memory cache) → server-rendered Next pages. Empty-store fallback: server pages call `fetchCars()` directly against Encar. Lead capture posts to `/api/lead`, which `appendFileSync`s to `data/leads.jsonl`.

For full detail: [wiki/architecture.md](wiki/architecture.md)

## Rules

1. **Run from `web/`** — paths use `process.cwd()`; PM2 sets `cwd: "web/"` (`web/ecosystem.config.cjs:8`, `web/src/lib/car-store.ts:7`).
2. **Keep DB writers and reader in sync** — `sync-cars.ts`, `rebuild-db-from-cache.ts`, `car-store.ts` share the `status`/`bookedAt`/`parsed` shape (`web/src/lib/car-store.ts:17`, `web/scripts/sync-cars.ts:41`).
3. **Single Next process** — JSONL appends and process-local cache assume one writer (ADR-009, `web/ecosystem.config.cjs:13-14`).
4. **`booked` is inferred churn**, capped at 6% / max 30 / 24h TTL — never a confirmed sale (`web/scripts/sync-cars.ts:36-38`, `web/scripts/sync-cars.ts:277`).
5. **Currency rate `KRW_TO_RUB=0.063` is duplicated** in `encar-api.ts`, `sync-cars.ts`, `seed-cache.ts` — change all three together.
6. **Two parser surfaces, one external contract** — Python CLI for exports, TypeScript adapter for web; mapping logic is duplicated (ADR-002).

For full ADRs: [wiki/decisions.md](wiki/decisions.md)

## Gotchas (top)

- **Sync overwrites a corrupt DB with an empty shape.** `loadDatabase()` swallows parse errors and returns `{cars: []}`; the next write loses booked history (`web/scripts/sync-cars.ts:184-197`). Copy `cars.json` aside before recovery runs.
- **JSON writes are not atomic** — kill mid-`writeFileSync` truncates the file; `car-store.ts` then renders an empty catalog (`web/scripts/sync-cars.ts:195`, `web/src/lib/car-store.ts:74`). Switch to temp-file + rename.
- **`/api/lead` is unauthenticated and rate-limit-free** — bot can fill the disk with PII (`web/src/app/api/lead/route.ts:14-38`).
- **Live fallback can stampede Encar** when `data/db/cars.json` is empty — home + catalog issue concurrent `fetchCars()` calls (`web/src/app/page.tsx:86-89`, `web/src/app/catalog/page.tsx:15-16`).
- **Synchronous `appendFileSync` blocks the event loop** under lead spam (`web/src/app/api/lead/route.ts:38`).
- **Client filters only see `initialCars`** (≤200 on fallback) — full-corpus filtering is a UI lie (`web/src/app/catalog/catalog-client.tsx:114`).

Full list with Critical/High/Medium/Low: [wiki/gotchas.md](wiki/gotchas.md)

## Testing

No test runner is declared. `web/package.json` has `dev`, `build`, `start`, `rebuild-db` only; Python `requirements.txt` has runtime deps only (`wiki/gotchas.md` → "No automated tests are declared"). Until tests exist: manually exercise `/`, `/catalog`, a brand page, a detail page, `GET /api/cars?limit=1`, `GET /api/sitemap-xml`, `POST /api/lead` after changes (see `wiki/deployment.md` smoke checks).

Active tasks: no active pipeline tasks at last snapshot (`wiki/active-tasks.md`).

## Wiki

The wiki under `wiki/` is the single source of truth for this project. This file
(PROJECT.md) plus README.md and CLAUDE.md are re-derived from it — never edit them
by hand. Wiki itself is updated automatically after every dev-orchestrator task,
WikiFreshness scheduler tick, or manual `POST /wiki/ingest/encar-parser`.

### Search

- **CLI** (recommended): `qmd query "<concept>" -c encar-parser`
- **HTTP** (for agents/MCP): `curl 'http://127.0.0.1:9092/wiki/search/encar-parser?q=<term>&limit=10'`
- **Browser**: `/pipeline/wiki/encar-parser` (search box in sidebar)

### Update after changes

- `POST http://127.0.0.1:9092/wiki/ingest/encar-parser?diffMode=worktree` — uncommitted edits
- `POST http://127.0.0.1:9092/wiki/ingest/encar-parser?diffMode=committed` — new commits
- `POST http://127.0.0.1:9092/entity/wiki/encar-parser` — full rewrite (~10 min)

### Pages

- `wiki/index.md` — catalog with one-line descriptions (open this first if not using QMD)
- `wiki/overview.md` — stack and quick start
- `wiki/architecture.md` — structure and data flows
- `wiki/decisions.md` — 9 ADRs with `file:line` evidence
- `wiki/gotchas.md` — sharp edges (3 Critical / 4 High / 5 Medium / 4 Low)
- `wiki/active-tasks.md` — in-flight pipeline work
- `wiki/active-areas.md` — churn hotspots from git/sync logs
- `wiki/deployment.md` — PM2 runbook, sync cron, troubleshooting, rollback
- `wiki/gaps.md` — undocumented code, open questions
- `wiki/log.md` — INIT / INGEST / LINT / DERIVE journal

---

**Last derive:** `2026-04-29`
