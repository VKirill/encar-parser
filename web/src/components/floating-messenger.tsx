"use client";

import { useState } from "react";

export function FloatingMessenger() {
  const [hovered, setHovered] = useState(false);

  function openTelegram() {
    window.open("https://t.me/encar_korea", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      {/* Tooltip */}
      <div
        className="text-[13px] font-medium text-white px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-all duration-200"
        style={{
          backgroundColor: "#0F1724",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(6px)",
        }}
        aria-hidden="true"
      >
        Написать в Telegram
      </div>

      <button
        onClick={openTelegram}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Написать в Telegram"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#2AABEE", minWidth: 44, minHeight: 44 }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden="true"
        >
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </button>
    </div>
  );
}
