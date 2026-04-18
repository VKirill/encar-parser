---
name: automotive-ux-research
description: Comprehensive UX/UI research for automotive landing pages, car catalogs, and detail pages — patterns, trust blocks, pricing, SEO
type: project
---

# Automotive Landing Page & Catalog UX/UI Research

**Date:** 2026-03-27
**Project:** encar-parser/web (EncarKorea — Korean car import service)
**Stack:** Next.js 16 + Tailwind CSS 4 (dark theme, DM Sans font)

## Current State Analysis

The project currently has:
- Minimal hero section (stats only, no CTA in hero)
- Flat brand filter (pill buttons by manufacturer group)
- Car cards with photos, specs grid, prices (KRW/USD/RUB), "Ostavit zayavku" CTA
- Lead form modal (name, phone, comment)
- Generic request section at bottom
- No detail pages, no SEO routing, no Schema.org, no trust blocks

---

## 1. Landing Page Best Practices for Automotive

### 1.1 Hero Section Structure (High-Converting)

**Best pattern: "Value Proposition + Visual + Inline Search"**

The highest-converting auto heroes follow this structure:

1. **Badge/label** (already exists: "Direct from Korea") — good
2. **H1 headline** — should be benefit-driven, not descriptive
   - Current: "Avtomobili iz Korei s polnym soprovozhdeniem" (descriptive)
   - Better: "Seconomte do 30% na avtomobile iz Korei" or "Vash avto iz Korei za 14 dney"
   - Pattern: **specific number + specific benefit**
3. **Subheadline** — address the main objection/fear
   - Current: generic process description
   - Better: "Vy plasite tolko posle polnoy proverki. Garantiya yur. chistoty. Strahovka sdelki."
4. **Hero CTA** — MISSING. Critical gap.
   - Primary: "Podberat avto" or "Rasschitat stoimost" (leads to calculator/form)
   - Secondary: "Smotret katalog" (scroll to catalog)
5. **Stats row** (already exists) — good, but numbers should be more specific and trustworthy
   - "2 847 avto dostavleno" > "150 000+ avto v baze" (personal achievement vs aggregator stat)
   - "4.9 na Yandex Kartakh" > "100% yur. chistota" (verifiable vs claim)
6. **Hero image/visual** — MISSING. Huge conversion factor.
   - Pattern A: Full-width lifestyle photo (car on Korean port/ship)
   - Pattern B: Split layout — text left, featured car right
   - Pattern C: Video background (port, loading, delivery process)

**Reference sites:**
- auto.ru uses search-centric hero (search bar is the hero)
- Companies like japanauto.ru, carvizor.com use lifestyle hero + calculator CTA
- Premium: BMW/Genesis dealer sites use full-bleed car photography

### 1.2 Trust Blocks (What Works in Auto Niche)

**Critical trust elements for car import business (ordered by impact):**

1. **Process transparency** (highest impact for import business)
   - Step-by-step timeline: "Podbor → Proverka → Pokupka → Dostavka → Tamozhnya → Vydacha"
   - Each step with estimated time (7-14 days total)
   - This is THE differentiator for import businesses vs aggregators

2. **Social proof — delivered cars gallery**
   - Real photos of delivered cars with client testimonials
   - Before/after format (Korean auction photo vs delivered in Russia)
   - Location tag ("dostavleno v Vladivostok, 12 dney")

3. **Guarantees block**
   - "Garantiya yur. chistoty" with explanation
   - "Strahovka sdelki" — money back if car doesn't match
   - "Ofitsialnoye rastamozheniye" — all documents
   - Pattern: 3-4 guarantee cards with icons, short text

4. **Numbers/stats block**
   - Years in business
   - Cars delivered (with specificity: "2 847 avto", not "1000+")
   - Average savings vs Russian market
   - Average delivery time

5. **Reviews/ratings**
   - Yandex Maps rating widget
   - Google Reviews
   - Video testimonials (most trusted in auto)

6. **Company info**
   - Legal entity details (INN, OGRN)
   - Office photos
   - Team photos (personal trust)
   - Licenses/certifications if applicable

### 1.3 Price Presentation

**For car import business, the CALCULATOR approach wins decisively over price lists.**

Why: The final price depends on too many variables (exchange rate, customs duty by engine size, EPTC, logistics, insurance). A static price misleads.

**Recommended approach: 3-tier pricing**

1. **On card** (catalog): Show price in KRW + estimated RUB (current approach is OK)
   - Add label: "tsena v Koree" to make it clear this isn't final
   - Add small text: "+ tamozhnya i dostavka"

2. **On detail page**: Price breakdown calculator
   - Base price (KRW → RUB by current rate)
   - Customs duty (calculated by engine volume and year)
   - EPTC (recycling fee)
   - Logistics (port → Vladivostok → client city)
   - Our commission
   - **TOTAL "pod klyuch"**

3. **Interactive calculator widget** (separate section or standalone page)
   - Input: car price in KRW, engine volume, year, fuel type, destination city
   - Output: full cost breakdown
   - CTA: "Poluchit tochniy raschet" (leads to lead form with pre-filled data)

### 1.4 CTA Buttons and Forms (Conversion)

**Best practices for auto landing CTA:**

- **Primary CTA text**: Action-oriented, specific benefit
  - "Rasschitat stoimost" > "Ostavit zayavku" (value vs obligation)
  - "Podberat avto" > "Zakazat avto" (low commitment vs high)
  - "Uznat tsenu pod klyuch" — best for import business

- **CTA placement**: Every scroll screen should have a CTA path
  - Hero: primary CTA button
  - Sticky header: "Zakazat avto" (already exists)
  - After every 8-12 car cards: inline CTA banner
  - After trust blocks: contextual CTA
  - Bottom: full request section (exists)
  - Floating: WhatsApp/Telegram button (critical for auto niche)

- **Form optimization:**
  - Minimal first step: phone only (or messenger link)
  - "Callback in 15 min" promise
  - Show what happens after form: "Manager svyazhetsya → Podberyom varianty → Otpravim raschet"
  - Add messenger buttons as alternative to phone form
  - Phone mask input is mandatory (+7 format)

---

## 2. Car Catalog UX

### 2.1 Filter Organization

**Recommendation: Horizontal filter bar (top) + side panel for advanced filters on desktop**

For THIS project specifically (brand is the primary filter), current approach of pill buttons is acceptable but needs enhancement:

**Current gaps:**
- No price range filter
- No year range filter
- No fuel type filter
- No sort options
- No search within catalog

**Recommended filter hierarchy:**
1. **Top row (always visible):** Brand pills (current) + Sort dropdown (price/year/mileage)
2. **Expandable "Advanced filters":** Price range, Year range, Fuel type, Mileage range, Transmission
3. **Active filters summary:** Chips showing active filters with "x" to remove
4. **Results count:** Dynamic count updates (current approach is good)

**Mobile behavior:**
- Sticky filter bar at top
- "Filters" button opens bottom sheet (not full page)
- Most important: brand + sort always visible

**Why NOT side panel for this project:**
- Limited number of filter criteria (not like auto.ru with 50+ parameters)
- Side panel wastes space when catalog is the main content
- Horizontal pills work well for 15-20 brands

### 2.2 Car Card Design (Engagement Optimization)

**Current card analysis:** Good foundation. Improvements:

**Photo area:**
- Current: 4:3 aspect, dots navigation — good
- Add: Photo count badge ("1/10")
- Add: Hover behavior on desktop — show next photo on hover (left/right areas)
- Add: "Provereno" badge is good — make it more prominent
- Add: Favorite/save button (even without auth — localStorage)

**Information hierarchy on card:**
- Line 1: **Brand + Model** (bold, primary) — good
- Line 2: **Badge/Trim** — good
- Line 3: **Key specs** (2x2 grid) — good, but icons are too detailed/custom
  - Use simpler iconography: text labels with separators work just as well
  - Essential on card: Year, Mileage, Fuel, Transmission
- Line 4: **Price** — needs improvement
  - Primary: RUB price (what user actually pays approximately)
  - Secondary: KRW (for reference)
  - Remove USD (irrelevant for RU audience)
  - Add: "ot X RUB pod klyuch" estimate
- CTA: "Uznat tsenu" > "Ostavit zayavku" (lower friction)

**What to REMOVE from card (move to detail):**
- Office city (irrelevant for import — all cars are in Korea)
- Multiple price currencies (keep RUB primary, KRW small)

**What to ADD to card:**
- Engine volume (critical for customs calculation)
- Color (or color dot)
- "New" badge for cars listed <24h
- Quick comparison checkbox (optional, later feature)

**Card interaction patterns:**
- Click on card → goes to detail page (not modal)
- Click on CTA → opens lead form (current approach)
- Click on photo → swipe gallery
- Hover on card → subtle lift/glow (current approach is good)

### 2.3 Grid Layout

- Desktop: 3-4 columns (current 4 on XL is fine but might be too dense)
- Tablet: 2 columns
- Mobile: 1 column (NOT 2 — car cards need breathing room on mobile)
- Consider: After every 6-8 cards, insert a CTA banner or trust element

---

## 3. Detail Page Structure

### 3.1 Recommended Layout (Top to Bottom)

```
[Breadcrumbs: Главная > Каталог > Hyundai > Tucson]

[Gallery — 60% width]  [Sticky Price Panel — 40% width]
  - Main photo large      - Price breakdown
  - Thumbnail strip        - "Расчитать под ключ" CTA
  - Fullscreen mode        - "Написать в Telegram" CTA
                           - Manager photo + name
                           - Quick specs summary

[Tab section]
  - Характеристики (specs table)
  - Описание (auto-generated text about this model)
  - Калькулятор растаможки (interactive)
  - Похожие автомобили

[Trust block — process steps]
[Reviews carousel]
[Bottom CTA — full request form]
```

### 3.2 Gallery Best Practices

- Main photo: 16:9 or 3:2, large
- Thumbnails: horizontal strip below, scrollable
- Click for fullscreen lightbox with swipe
- Photo count indicator
- If inspection report photos available — separate tab "Otchyot o proverke"
- Zoom on hover (desktop)

### 3.3 Sticky Price Panel (Right Side on Desktop)

This is THE conversion element. Pattern from successful auto sites:

```
[Price in KRW]
[Estimated price in RUB — large, bold, accent color]
[Small text: "примерная стоимость под ключ"]

[Breakdown toggle]
  Автомобиль: X RUB
  Таможня: ~X RUB
  Доставка: ~X RUB
  Наша комиссия: X RUB

[Primary CTA: "Узнать точную стоимость"]
[Secondary CTA: "Написать в Telegram"]

[Trust micro-elements]
  ✓ Проверка перед покупкой
  ✓ Гарантия юр. чистоты
  ✓ Доставка 7-14 дней
```

This panel should be **sticky** on desktop (follows scroll until footer).

### 3.4 Making Detail Page Feel Like a Landing

Key technique: **Interleave product info with trust/conversion blocks**

Instead of: Specs → Specs → Specs → CTA at bottom
Do: Specs → Trust element → More specs → Calculator → Social proof → CTA

Specific blocks to include on detail page:
1. **"Kak my proveryaem avto"** — 3-4 step inspection process
2. **"Pochemu imenno etot avto"** — auto-generated value proposition (low mileage, popular model, good condition)
3. **"Podobnye avto"** — similar cars carousel (creates browsing loop)
4. **"Klienty kotorye zakazali X"** — model-specific testimonials
5. **Price calculator** — interactive, embedded in page

---

## 4. Cross-Page (Persistent) Blocks

### 4.1 Must-Have Persistent Blocks

1. **Sticky header** (exists) — logo, nav, primary CTA
   - Add: phone number (click to call on mobile)
   - Add: Telegram/WhatsApp icon link

2. **Floating messenger button** (bottom-right)
   - WhatsApp or Telegram (primary communication channel for auto business)
   - Should be on every page
   - Collapsed by default, expandable

3. **Footer** (exists but minimal)
   - Must contain: legal info, contacts, social links, navigation
   - Trust element: "Rabotaem ofitsialno. IP/OOO XXX, INN XXXXXXXXXX"
   - Popular brands links (for SEO)
   - Calculator link, FAQ link

### 4.2 Recommended Persistent Blocks

4. **Trust bar** (thin strip above or below header)
   - "Dostavka 7-14 dney | Garantiya yur. chistoty | Ofitsialnoye rastamozheniye"
   - Subtle, doesn't dominate — just reinforces trust on every page

5. **Notification/promo bar** (top, dismissable)
   - "Kurs vona segodnya: 1 KRW = X.XX RUB" (useful info for this business)
   - Or seasonal promo

### 4.3 How NOT to Overload

- Maximum 3 persistent UI elements visible simultaneously (header, floating button, footer)
- Trust bar is thin (32-40px) and integrates into header visually
- Floating button is minimized to icon by default
- NO persistent bottom bar on mobile (kills UX)
- NO persistent cookie consent overlays (use minimal banner)
- Promo bar should be dismissable and remember dismissal (localStorage)

---

## 5. SEO for Auto Catalogs

### 5.1 URL Structure

**Recommended hierarchy:**

```
/                           — Homepage with hero + featured cars
/catalog/                   — Full catalog with all filters
/catalog/hyundai/           — Brand page
/catalog/hyundai/tucson/    — Model page
/catalog/hyundai/tucson/2024/ — Year+model (optional, depends on volume)
/car/[id]-[slug]/           — Detail page: /car/12345-hyundai-tucson-2024/
/calculator/                — Price calculator page
/how-it-works/              — Process page (trust/info)
/reviews/                   — Client reviews page
/contacts/                  — Contact page
```

**Key principles:**
- Transliterated Russian or English brand names (not Korean)
- Slugified: lowercase, hyphens, no special chars
- Car detail page: ID + human-readable slug for both uniqueness and SEO
- Avoid query parameters for filterable pages — use path segments or at least canonical URLs

### 5.2 Schema.org Markup

**Essential schemas for auto catalog:**

1. **Vehicle (schema.org/Vehicle)** — on each car detail page
```json
{
  "@type": "Vehicle",
  "name": "Hyundai Tucson 2024",
  "brand": { "@type": "Brand", "name": "Hyundai" },
  "model": "Tucson",
  "vehicleModelDate": "2024",
  "mileageFromOdometer": {
    "@type": "QuantitativeValue",
    "value": "35000",
    "unitCode": "KMT"
  },
  "fuelType": "Gasoline",
  "vehicleTransmission": "Automatic",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "RUB",
    "price": "2500000",
    "availability": "InStock"
  },
  "image": ["url1", "url2"]
}
```

2. **Organization** — on all pages (in layout)
```json
{
  "@type": "Organization",
  "name": "EncarKorea",
  "description": "Import cars from South Korea",
  "url": "https://encarkorea.ru",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+7-XXX-XXX-XX-XX",
    "contactType": "sales"
  }
}
```

3. **BreadcrumbList** — on catalog and detail pages
4. **FAQPage** — on FAQ section/page
5. **Review/AggregateRating** — on reviews page and detail pages
6. **ItemList** — on catalog pages (list of Vehicle items)
7. **WebSite with SearchAction** — for sitelinks searchbox

### 5.3 Unique Content Generation for Brand/Model Pages

**Strategy: Template + Dynamic Data + SEO Text**

For each brand page (`/catalog/hyundai/`):
1. **Auto-generated intro**: "Hyundai — odin iz krupneyshikh avtoproizvoditeley Yuzhnoy Korei. My predlagaem [N] modeley Hyundai s dostavkoy v Rossiyu."
2. **Popular models**: Top 5 models by listing count
3. **Price range**: "Tseny na Hyundai iz Korei: ot X do Y RUB"
4. **FAQ section**: "Skolko stoit prigonat Hyundai iz Korei?" / "Kakiye modeli Hyundai populyarny v Koree?" — auto-generated from data
5. **Comparison**: "Hyundai Tucson v Koree vs v Rossii: ekonomiya do 25%"

For each model page (`/catalog/hyundai/tucson/`):
1. **Model description** template
2. **Available generations/years** with count
3. **Average price** with historical trend
4. **Specs comparison** table (popular trims)
5. **Client reviews** filtered by this model
6. **Similar models** from other brands

**Content uniqueness techniques:**
- Mix static templates with dynamic data from API
- Include current pricing (changes with each revalidation)
- Include counts ("seychas v baze: 47 Hyundai Tucson")
- Regional pricing variations
- User-generated content (reviews)

---

## Comparison Table: Current State vs Recommended

| Element | Current State | Recommended | Priority |
|---------|--------------|-------------|----------|
| Hero CTA button | Missing | "Rasschitat stoimost" + "Smotret katalog" | P0 |
| Hero visual/image | Missing | Car photo or video | P0 |
| Trust blocks | Missing | Process steps, guarantees, stats | P0 |
| Price calculator | Missing | Interactive calculator page + widget | P0 |
| Messenger float button | Missing | Telegram/WhatsApp floating icon | P0 |
| Detail pages | Missing (links to encar.com) | Own detail pages with price breakdown | P1 |
| Brand pages | Missing | /catalog/brand/ with SEO content | P1 |
| Advanced filters | Brand only | Price, year, fuel, sort | P1 |
| Schema.org markup | Missing | Vehicle, Organization, BreadcrumbList | P1 |
| Sticky price panel | Missing | On detail pages | P1 |
| Phone in header | Missing | Click-to-call phone number | P2 |
| Trust bar | Missing | Thin strip under header | P2 |
| Reviews section | Missing | Client testimonials | P2 |
| Company info page | Missing | Legal details, team, office | P2 |
| FAQ section | Missing | SEO-optimized FAQ | P2 |
| Favorites/saved | Missing | LocalStorage favorites | P3 |
| Comparison feature | Missing | Compare 2-3 cars | P3 |
| Blog/articles | Missing | Model reviews, import guides | P3 |

---

## Key Recommendations Summary

1. **Hero must have a CTA and a visual.** Current hero is informational, not converting. Add a primary button and car imagery.

2. **Trust blocks are the #1 missing element.** For car import business, trust is EVERYTHING. Add process steps, guarantees, and social proof before asking for leads.

3. **Switch from "Ostavit zayavku" to "Uznat tsenu."** Lower-commitment CTA consistently outperforms.

4. **Build a price calculator.** This is the most valuable tool for car import sites. Users want to understand total cost before contacting.

5. **Create own detail pages** instead of linking to encar.com. Every click to external site is a lost conversion.

6. **Add floating Telegram/WhatsApp button.** Auto business in Russia runs on messengers, not phone calls.

7. **Implement SEO routing** (`/catalog/brand/model/`) with auto-generated content per brand/model.

8. **Show RUB price as primary** on cards, KRW as secondary. Users think in rubles.

---

## Sources

- Analysis of auto.ru, drom.ru card/listing patterns
- Analysis of japanauto.ru, carvizor.com, atlantm.by import business sites
- Baymard Institute: E-commerce product listing UX (automotive category)
- Nielsen Norman Group: Product page design patterns
- Schema.org Vehicle specification
- Google Search Central: structured data for vehicles
- Conversion rate benchmarks from automotive dealer studies (CDK Global, DealerSocket)
- UX analysis of Hyundai.ru, Kia.ru official dealer sites
