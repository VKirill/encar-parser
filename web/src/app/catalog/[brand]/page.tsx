import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchBrandStats,
  getAllBrandSlugs,
  MANUFACTURER_LABELS,
} from "@/lib/encar-api";
import { getBrandStats as getStoreBrandStats, getCarsByBrand } from "@/lib/car-store";
import { getBrandSEO } from "@/lib/brand-data";
import { FaqSection } from "@/components/faq-section";
import { RequestSection } from "@/components/request-section";
import { CatalogClient } from "../catalog-client";

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU");
}

export async function generateStaticParams(): Promise<{ brand: string }[]> {
  return getAllBrandSlugs().map((brand) => ({ brand }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const seo = getBrandSEO(brand);
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  const seo = getBrandSEO(brand);
  if (!seo) notFound();

  const storeStats = getStoreBrandStats(brand);
  const storeCars = getCarsByBrand(brand);

  // Если в локальной БД есть данные — используем их, иначе fallback на API
  const stats = storeStats.total > 0 ? storeStats : await fetchBrandStats(brand);
  const carsForCatalog = storeStats.total > 0 ? storeCars : stats.cars;

  const brandLabel = MANUFACTURER_LABELS[brand] ?? seo.nameEn;
  const topModels = stats.models.slice(0, 5);

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Хлебные крошки */}
        <nav
          className="flex items-center gap-2 text-[13px] text-text-secondary mb-6 overflow-x-auto whitespace-nowrap"
          aria-label="Хлебные крошки"
        >
          <a href="/" className="hover:text-text-primary transition-colors cursor-pointer">
            Главная
          </a>
          <span className="text-text-muted" aria-hidden="true">/</span>
          <a
            href="/catalog"
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Каталог
          </a>
          <span className="text-text-muted" aria-hidden="true">/</span>
          <span className="text-text-primary">{brandLabel}</span>
        </nav>

        {/* Заголовок */}
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
          {seo.h1}
        </h1>
        <p className="text-[15px] text-text-secondary leading-relaxed max-w-3xl mb-8">
          {seo.intro}
        </p>

        {/* Статистика */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <div className="bg-white border border-border rounded-2xl p-4 text-center shadow-sm">
              <p className="text-[22px] font-bold text-accent">
                {stats.total}
              </p>
              <p className="text-[12px] text-text-secondary mt-0.5">
                авто в наличии
              </p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-4 text-center shadow-sm">
              <p className="text-[22px] font-bold text-text-primary">
                от {formatPrice(stats.minPrice)} ₽
              </p>
              <p className="text-[12px] text-text-secondary mt-0.5">
                минимальная цена
              </p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-4 text-center shadow-sm">
              <p className="text-[22px] font-bold text-text-primary">
                ~{formatPrice(stats.avgPrice)} ₽
              </p>
              <p className="text-[12px] text-text-secondary mt-0.5">
                средняя цена
              </p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-4 text-center shadow-sm">
              <p className="text-[22px] font-bold text-text-primary">
                {formatPrice(stats.avgMileage)} км
              </p>
              <p className="text-[12px] text-text-secondary mt-0.5">
                средний пробег
              </p>
            </div>
          </div>
        )}

        {/* Популярные модели */}
        {topModels.length > 0 && (
          <div className="mb-10">
            <h2 className="text-[18px] font-bold text-text-primary mb-4">
              Популярные модели
            </h2>
            <div className="flex flex-wrap gap-3">
              {topModels.map((m) => (
                <div
                  key={m.name}
                  className="bg-white border border-border rounded-xl px-4 py-3 shadow-sm"
                >
                  <p className="text-[14px] font-semibold text-text-primary">
                    {m.name}
                  </p>
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    {m.count} авто
                    {m.minPrice > 0 && (
                      <> &middot; от {formatPrice(m.minPrice)} ₽</>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Каталог с фильтрами */}
      <CatalogClient initialCars={carsForCatalog} totalAvailable={carsForCatalog.length} contextBrand={brand} />

      {/* Преимущества */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-[18px] font-bold text-text-primary mb-4">
          Почему {brandLabel} из Кореи выгоден
        </h2>
        <ul className="space-y-3">
          {seo.advantages.map((adv, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px] text-text-secondary">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 mt-0.5 text-accent"
                aria-hidden="true"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              {adv}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-text-primary mb-6">Вопросы о {brandLabel}</h2>
        <FaqSection items={seo.faq} />
      </div>

      {/* CTA */}
      <RequestSection />
    </main>
  );
}
