import type { Metadata } from "next";
import { getAllBrandSlugs, MANUFACTURER_LABELS } from "@/lib/encar-api";

export const metadata: Metadata = {
  title: "Карта сайта | EncarKorea",
  description: "Полная карта сайта EncarKorea — все страницы каталога, марки, фильтры.",
};

const FILTER_PAGES = [
  { slug: "diesel", label: "Дизельные авто", desc: "Дизельные автомобили из Кореи" },
  { slug: "electric", label: "Электромобили", desc: "Электрические авто из Кореи" },
  { slug: "hybrid", label: "Гибридные авто", desc: "Гибридные автомобили из Кореи" },
  { slug: "korean", label: "Корейские авто", desc: "Hyundai, Kia, Genesis, SsangYong" },
  { slug: "foreign", label: "Импортные авто", desc: "BMW, Mercedes, Audi, Toyota и др." },
  { slug: "manual", label: "Авто с МКПП", desc: "Механическая коробка передач" },
];

const COMBO_PAGES = [
  { slug: "hyundai-diesel", label: "Hyundai дизель" },
  { slug: "hyundai-electric", label: "Hyundai электро" },
  { slug: "hyundai-hybrid", label: "Hyundai гибрид" },
  { slug: "kia-diesel", label: "Kia дизель" },
  { slug: "kia-electric", label: "Kia электро" },
  { slug: "kia-hybrid", label: "Kia гибрид" },
  { slug: "genesis-diesel", label: "Genesis дизель" },
  { slug: "genesis-electric", label: "Genesis электро" },
  { slug: "genesis-hybrid", label: "Genesis гибрид" },
];

const TRANSMISSION_PAGES = [
  { slug: "hyundai-auto", label: "Hyundai с АКПП" },
  { slug: "kia-auto", label: "Kia с АКПП" },
  { slug: "genesis-auto", label: "Genesis с АКПП" },
];

const PRICE_PAGES = [
  { slug: "hyundai-do-2mln", label: "Hyundai до 2 млн ₽" },
  { slug: "hyundai-do-3mln", label: "Hyundai до 3 млн ₽" },
  { slug: "kia-do-2mln", label: "Kia до 2 млн ₽" },
  { slug: "kia-do-3mln", label: "Kia до 3 млн ₽" },
  { slug: "genesis-do-3mln", label: "Genesis до 3 млн ₽" },
  { slug: "genesis-do-5mln", label: "Genesis до 5 млн ₽" },
];

const MODEL_PAGES = [
  { slug: "hyundai-tucson", label: "Hyundai Tucson" },
  { slug: "hyundai-santa-fe", label: "Hyundai Santa Fe" },
  { slug: "hyundai-palisade", label: "Hyundai Palisade" },
  { slug: "kia-sportage", label: "Kia Sportage" },
  { slug: "kia-sorento", label: "Kia Sorento" },
  { slug: "kia-carnival", label: "Kia Carnival" },
];

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-muted" aria-hidden="true">
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] font-bold text-text-primary mb-4 flex items-center gap-2">
      {children}
    </h2>
  );
}

function SiteLink({ href, label, desc }: { href: string; label: string; desc?: string }) {
  return (
    <li>
      <a
        href={href}
        className="group flex items-start gap-2.5 py-2 px-3 -mx-3 rounded-lg hover:bg-accent-soft transition-colors duration-150 cursor-pointer"
      >
        <LinkIcon />
        <div>
          <span className="text-[14px] text-accent group-hover:text-accent-hover font-medium transition-colors">
            {label}
          </span>
          {desc && (
            <p className="text-[12px] text-text-muted mt-0.5">{desc}</p>
          )}
        </div>
      </a>
    </li>
  );
}

export default function SitemapPage() {
  const brands = getAllBrandSlugs();

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Заголовок */}
        <nav className="flex items-center gap-2 text-[13px] text-text-secondary mb-6" aria-label="Хлебные крошки">
          <a href="/" className="hover:text-text-primary transition-colors cursor-pointer">Главная</a>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary">Карта сайта</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Карта сайта
        </h1>
        <p className="text-[15px] text-text-secondary mb-10">
          Все страницы EncarKorea для быстрой навигации
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Основные страницы */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
              Основные
            </SectionTitle>
            <ul className="space-y-0.5">
              <SiteLink href="/" label="Главная" desc="Лендинг с каталогом и калькулятором" />
              <SiteLink href="/catalog" label="Каталог автомобилей" desc="Все авто с фильтрами и сортировкой" />
              <SiteLink href="/sitemap" label="Карта сайта" />
            </ul>
          </div>

          {/* Марки авто */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9" />
              </svg>
              Марки автомобилей
            </SectionTitle>
            <ul className="space-y-0.5">
              {brands.map((slug) => (
                <SiteLink
                  key={slug}
                  href={`/catalog/${slug}`}
                  label={MANUFACTURER_LABELS[slug] ?? slug}
                  desc={`${MANUFACTURER_LABELS[slug] ?? slug} из Кореи`}
                />
              ))}
            </ul>
          </div>

          {/* По типу топлива / КПП */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
              </svg>
              По типу
            </SectionTitle>
            <ul className="space-y-0.5">
              {FILTER_PAGES.map((f) => (
                <SiteLink key={f.slug} href={`/catalog/${f.slug}`} label={f.label} desc={f.desc} />
              ))}
            </ul>
          </div>

          {/* Комбинации марка + тип */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm md:col-span-2 lg:col-span-3">
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Марка + тип двигателя
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
              <ul className="space-y-0.5">
                {COMBO_PAGES.slice(0, 3).map((c) => (
                  <SiteLink key={c.slug} href={`/catalog/${c.slug}`} label={c.label} />
                ))}
              </ul>
              <ul className="space-y-0.5">
                {COMBO_PAGES.slice(3, 6).map((c) => (
                  <SiteLink key={c.slug} href={`/catalog/${c.slug}`} label={c.label} />
                ))}
              </ul>
              <ul className="space-y-0.5">
                {COMBO_PAGES.slice(6).map((c) => (
                  <SiteLink key={c.slug} href={`/catalog/${c.slug}`} label={c.label} />
                ))}
              </ul>
            </div>
          </div>

          {/* Марка + АКПП */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Марка + АКПП
            </SectionTitle>
            <ul className="space-y-0.5">
              {TRANSMISSION_PAGES.map((p) => (
                <SiteLink key={p.slug} href={`/catalog/${p.slug}`} label={p.label} />
              ))}
            </ul>
          </div>

          {/* Марка + цена */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm md:col-span-2">
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Марка + ценовой диапазон
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <ul className="space-y-0.5">
                {PRICE_PAGES.slice(0, 3).map((p) => (
                  <SiteLink key={p.slug} href={`/catalog/${p.slug}`} label={p.label} />
                ))}
              </ul>
              <ul className="space-y-0.5">
                {PRICE_PAGES.slice(3).map((p) => (
                  <SiteLink key={p.slug} href={`/catalog/${p.slug}`} label={p.label} />
                ))}
              </ul>
            </div>
          </div>

          {/* Популярные модели */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm md:col-span-2 lg:col-span-3">
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              Популярные модели
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
              <ul className="space-y-0.5">
                {MODEL_PAGES.slice(0, 2).map((p) => (
                  <SiteLink key={p.slug} href={`/catalog/${p.slug}`} label={p.label} />
                ))}
              </ul>
              <ul className="space-y-0.5">
                {MODEL_PAGES.slice(2, 4).map((p) => (
                  <SiteLink key={p.slug} href={`/catalog/${p.slug}`} label={p.label} />
                ))}
              </ul>
              <ul className="space-y-0.5">
                {MODEL_PAGES.slice(4).map((p) => (
                  <SiteLink key={p.slug} href={`/catalog/${p.slug}`} label={p.label} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
