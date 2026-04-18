"use client";

import { QuickSearch } from "./quick-search";

const BASE_STATS = [
  { value: "до 40%", label: "экономия от цен РФ" },
  { value: "14 дней", label: "средний срок доставки" },
  { value: "под ключ", label: "цена фиксируется в договоре" },
];

export function Hero({ totalOnEncar }: { totalOnEncar?: number }) {
  const stats = totalOnEncar && totalOnEncar > 0
    ? [{ value: totalOnEncar.toLocaleString("ru-RU"), label: "авто на Encar прямо сейчас" }, ...BASE_STATS]
    : BASE_STATS;
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-cta/[0.03]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cta/[0.04] rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent-soft border border-accent/15 rounded-full text-[13px] text-accent font-medium mb-5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Прямые поставки из Южной Кореи в Россию
          </div>

          {/* H1 — давим на боль: переплата на российском рынке */}
          <h1 className="text-3xl sm:text-[42px] font-bold text-text-primary leading-[1.12] tracking-tight">
            Зачем переплачивать
            <br />
            <span className="text-accent">за авто в России?</span>
          </h1>

          {/* Подзаголовок — снимаем возражение, конкретная выгода */}
          <p className="text-[17px] text-text-secondary mt-5 max-w-lg leading-relaxed">
            Hyundai Tucson из Кореи — <span className="font-semibold text-text-primary">от 1,8 млн ₽</span> вместо 3,5 млн на российском рынке.
            Проверяем, покупаем и доставляем. Оплата только после осмотра.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href="#calculator"
              className="inline-flex items-center h-12 px-6 bg-cta hover:bg-cta-hover text-white text-[15px] font-semibold rounded-xl transition-colors duration-150 cursor-pointer shadow-sm"
            >
              Рассчитать стоимость под ключ
            </a>
            <a
              href="/catalog"
              className="inline-flex items-center h-12 px-6 bg-white border border-border hover:border-accent/40 hover:shadow-sm text-text-primary text-[15px] font-semibold rounded-xl transition-all duration-150 cursor-pointer"
            >
              Смотреть каталог
            </a>
          </div>

          {/* Quick Search */}
          <QuickSearch />

          {/* Stats */}
          <div className="flex gap-8 sm:gap-12 mt-10 pt-8 border-t border-border">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-bold text-accent">
                  {s.value}
                </p>
                <p className="text-[13px] text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
