import type { MetadataRoute } from "next";
import { getAllBrandSlugs } from "@/lib/encar-api";

const BASE = "https://encar.vechkasov.pro";
const FILTER_SLUGS = ["diesel", "electric", "hybrid", "korean", "foreign", "manual"];
const FUEL_SLUGS = ["diesel", "electric", "hybrid"];
const COMBO_BRANDS = ["hyundai", "kia", "genesis"];

const TRANSMISSION_SLUGS = ["hyundai-auto", "kia-auto", "genesis-auto"];
const PRICE_SLUGS = [
  "hyundai-do-2mln",
  "hyundai-do-3mln",
  "kia-do-2mln",
  "kia-do-3mln",
  "genesis-do-3mln",
  "genesis-do-5mln",
];
const MODEL_SLUGS = [
  "hyundai-tucson",
  "hyundai-santa-fe",
  "hyundai-palisade",
  "kia-sportage",
  "kia-sorento",
  "kia-carnival",
];

/** Данные для sitemap — используется и в sitemap.ts и в route handler */
export function getSitemapEntries(): MetadataRoute.Sitemap {
  const brands = getAllBrandSlugs();
  const now = new Date();

  const brandPages = brands.map((brand) => ({
    url: `${BASE}/catalog/${brand}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const filterPages = FILTER_SLUGS.map((slug) => ({
    url: `${BASE}/catalog/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const comboPages: MetadataRoute.Sitemap = [];
  for (const brand of COMBO_BRANDS) {
    for (const fuel of FUEL_SLUGS) {
      comboPages.push({
        url: `${BASE}/catalog/${brand}-${fuel}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.75,
      });
    }
  }

  const transmissionPages = TRANSMISSION_SLUGS.map((slug) => ({
    url: `${BASE}/catalog/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const pricePages = PRICE_SLUGS.map((slug) => ({
    url: `${BASE}/catalog/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const modelPages = MODEL_SLUGS.map((slug) => ({
    url: `${BASE}/catalog/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  return [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/catalog`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/sitemap`, lastModified: now, changeFrequency: "weekly", priority: 0.3 },
    ...brandPages,
    ...filterPages,
    ...comboPages,
    ...transmissionPages,
    ...pricePages,
    ...modelPages,
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapEntries();
}
