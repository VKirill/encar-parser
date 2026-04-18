"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function FaqSection({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-bold text-text-primary">
            Частые вопросы
          </h2>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index}>
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer hover:bg-bg-surface transition-colors duration-150"
                  style={{ minHeight: 44 }}
                >
                  <span className="text-[15px] font-medium text-text-primary">
                    {item.question}
                  </span>
                  <span className="flex-shrink-0 text-accent">
                    {isOpen ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? 500 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <p className="px-6 pb-5 text-[14px] text-text-secondary leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
