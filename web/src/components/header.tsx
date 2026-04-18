"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Калькулятор", href: "#calculator" },
  { label: "Как работаем", href: "#process" },
  { label: "Отзывы", href: "#cases" },
];

function CarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9" />
    </svg>
  );
}

function BurgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-border"
      style={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1D4ED8" }}>
            <CarIcon />
          </div>
          <div>
            <p className="text-[16px] font-bold text-text-primary leading-none">EncarKorea</p>
            <p className="text-[11px] text-text-muted mt-0.5">Авто из Кореи под заказ</p>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Навигация">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-[14px] text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-lg hover:bg-bg-surface cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+70000000000"
            className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-text-primary hover:text-accent transition-colors duration-150 cursor-pointer"
            aria-label="Позвонить нам"
          >
            <PhoneIcon />
            <span>+7 (XXX) XXX-XX-XX</span>
          </a>

          <a
            href="#request"
            className="hidden sm:flex h-9 px-4 text-white text-[13px] font-semibold rounded-lg transition-colors duration-150 items-center cursor-pointer"
            style={{ backgroundColor: "#EA580C" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F97316"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#EA580C"; }}
          >
            Подобрать авто
          </a>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors duration-150 cursor-pointer"
          >
            {menuOpen ? <CloseIcon /> : <BurgerIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        style={{
          maxHeight: menuOpen ? 400 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <nav className="flex flex-col px-4 pb-4 gap-1 border-t border-border bg-white overflow-y-auto max-h-[calc(100vh-4rem)]" aria-label="Мобильная навигация">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="px-3 py-3 text-[15px] text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-lg hover:bg-bg-surface cursor-pointer"
            >
              {link.label}
            </a>
          ))}

          <a
            href="tel:+70000000000"
            onClick={handleNavClick}
            className="flex items-center gap-2 px-3 py-3 text-[15px] text-text-primary transition-colors duration-150 cursor-pointer"
          >
            <PhoneIcon />
            +7 (XXX) XXX-XX-XX
          </a>

          <a
            href="#request"
            onClick={handleNavClick}
            className="mt-1 flex items-center justify-center h-11 px-4 text-white text-[14px] font-semibold rounded-xl transition-colors duration-150 cursor-pointer"
            style={{ backgroundColor: "#EA580C" }}
          >
            Подобрать авто
          </a>
        </nav>
      </div>
    </header>
  );
}
