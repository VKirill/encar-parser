"use client";

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU");
}

interface PricePanelProps {
  priceRUB: number;
  priceKRW: number;
  telegramUrl?: string;
}

export function PricePanel({ priceRUB, priceKRW, telegramUrl }: PricePanelProps) {
  function scrollToRequest() {
    const el = document.getElementById("request");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="lg:sticky lg:top-6 bg-bg-card border border-border rounded-2xl p-6 space-y-5">
      {/* Цены */}
      <div>
        <p className="text-[24px] sm:text-[28px] font-bold text-accent leading-tight">
          ~{formatPrice(priceRUB)} ₽
        </p>
        <p className="text-[13px] text-green font-medium mt-1">
          Экономия ~{Math.round(priceRUB * 0.4).toLocaleString("ru-RU")} ₽ от цен РФ рынка
        </p>
        <p className="text-[13px] text-text-muted mt-1">
          {formatPrice(priceKRW)} KRW · цена в Корее
        </p>
        <p className="text-[12px] text-text-secondary mt-0.5">
          Цена в Корее. Финальную стоимость под ключ рассчитает менеджер
        </p>
      </div>

      {/* Кнопки CTA */}
      <div className="space-y-3">
        <button
          onClick={scrollToRequest}
          className="w-full h-12 bg-cta hover:bg-cta-hover text-white text-[15px] font-semibold rounded-xl transition-colors duration-150 cursor-pointer"
        >
          Узнать точную стоимость
        </button>

        {telegramUrl ? (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 flex items-center justify-center gap-2 border border-accent text-accent hover:bg-accent-soft text-[14px] font-medium rounded-xl transition-colors duration-150 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
            </svg>
            Написать в Telegram
          </a>
        ) : (
          <a
            href="https://t.me/encarkr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 flex items-center justify-center gap-2 border border-accent text-accent hover:bg-accent-soft text-[14px] font-medium rounded-xl transition-colors duration-150 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
            </svg>
            Написать в Telegram
          </a>
        )}
      </div>

      {/* Гарантии */}
      <div className="border-t border-border pt-4 space-y-2.5">
        <div className="flex items-center gap-3 text-[13px] text-text-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-accent" aria-hidden="true">
            <path d="M9 12l2 2 4-4" />
            <path d="M12 2L3.5 6.5v5C3.5 16.6 7 21 12 22c5-1 8.5-5.4 8.5-10.5v-5L12 2z" />
          </svg>
          <span>Проверка перед покупкой</span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-text-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-accent" aria-hidden="true">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>Гарантия юридической чистоты</span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-text-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-accent" aria-hidden="true">
            <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9" />
            <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          </svg>
          <span>Доставка 7–14 дней</span>
        </div>
      </div>
    </div>
  );
}
