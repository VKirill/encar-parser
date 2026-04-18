"use client";

function CarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.844L.057 23.999l6.305-1.654A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.804 9.804 0 0 1-5.007-1.373l-.36-.214-3.72.976.993-3.626-.234-.373A9.777 9.777 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
    </svg>
  );
}

const BRANDS = [
  { label: "Hyundai", slug: "hyundai" },
  { label: "Kia", slug: "kia" },
  { label: "Genesis", slug: "genesis" },
  { label: "BMW", slug: "bmw" },
  { label: "Mercedes", slug: "mercedes" },
];

const INFO_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Калькулятор", href: "#calculator" },
  { label: "Как мы работаем", href: "#process" },
  { label: "О компании", href: "/about" },
];

const linkClass = "text-[13px] transition-colors duration-150 cursor-pointer text-white/55 hover:text-white";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#0F1724" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 1. Лого */}
          <div className="flex flex-col gap-4">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white/10">
                <CarIcon />
              </div>
              <span className="text-[15px] font-semibold text-white">EncarKorea</span>
            </a>
            <p className="text-[13px] leading-relaxed text-white/55">
              Пригон автомобилей из Южной Кореи с полным сопровождением. Экономия до 40% от цен российского рынка.
            </p>
          </div>

          {/* 2. Марки */}
          <div>
            <p className="text-[13px] font-semibold text-white mb-3">Марки</p>
            <ul className="flex flex-col gap-2">
              {BRANDS.map((brand) => (
                <li key={brand.slug}>
                  <a href={`/catalog/${brand.slug}/`} className={linkClass}>
                    {brand.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Информация */}
          <div>
            <p className="text-[13px] font-semibold text-white mb-3">Информация</p>
            <ul className="flex flex-col gap-2">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Контакты */}
          <div>
            <p className="text-[13px] font-semibold text-white mb-3">Контакты</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="tel:+70000000000" className={linkClass}>
                  +7 (XXX) XXX-XX-XX
                </a>
              </li>
              <li>
                <a href="mailto:info@encarkorea.ru" className={linkClass}>
                  info@encarkorea.ru
                </a>
              </li>
              <li>
                <a href="https://t.me/encar_korea" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 ${linkClass}`}>
                  <TelegramIcon />
                  Telegram
                </a>
              </li>
              <li>
                <a href="https://wa.me/70000000000" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 ${linkClass}`}>
                  <WhatsappIcon />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
          <p className="text-[12px] text-white/35">
            &copy; 2026 EncarKorea. Все права защищены.
          </p>
          <p className="text-[12px] text-white/35">
            ИНН/ОГРН: placeholder
          </p>
        </div>
      </div>
    </footer>
  );
}
