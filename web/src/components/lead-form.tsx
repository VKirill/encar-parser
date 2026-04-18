"use client";

import { useState, useEffect } from "react";
import type { CarListing } from "@/lib/encar-api";

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function LeadForm({
  car,
  onClose,
}: {
  car: CarListing | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  useEffect(() => {
    if (car) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [car]);

  if (!car) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setStatus("sending");

    try {
      const resp = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          comment: comment.trim(),
          carId: car.id,
          carTitle: `${car.manufacturer} ${car.model} ${car.badge}`,
          carYear: car.formYear,
          carPrice: car.priceKRW,
          carMileage: car.mileageKm,
        }),
      });

      if (resp.ok) {
        setStatus("sent");
        setTimeout(() => {
          setName("");
          setPhone("");
          setComment("");
          setStatus("idle");
          onClose();
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white border border-border rounded-2xl shadow-2xl p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Car summary */}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-text-primary">
            Заявка на пригон
          </h3>
          <div className="mt-2 p-3 bg-bg-card rounded-xl border border-border">
            <p className="text-[14px] font-medium text-text-primary">
              {car.manufacturer} {car.model}
            </p>
            <p className="text-[13px] text-text-secondary mt-0.5">
              {car.badge} {car.badgeDetail} &middot; {car.formYear} &middot;{" "}
              {formatPrice(car.mileageKm)} km
            </p>
            <p className="text-[14px] text-accent font-semibold mt-1">
              ~{formatPrice(car.priceRUB)} RUB
            </p>
          </div>
        </div>

        {status === "sent" ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <p className="text-[16px] font-semibold text-text-primary">
              Заявка отправлена!
            </p>
            <p className="text-[14px] text-text-secondary mt-1">
              Мы свяжемся с вами в ближайшее время
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] text-text-secondary mb-1.5 font-medium">
                Ваше имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван"
                required
                className="w-full h-11 px-4 bg-bg-input border border-border rounded-xl text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] text-text-secondary mb-1.5 font-medium">
                Телефон
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                required
                className="w-full h-11 px-4 bg-bg-input border border-border rounded-xl text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] text-text-secondary mb-1.5 font-medium">
                Комментарий
                <span className="text-text-muted font-normal ml-1">
                  (необязательно)
                </span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Желаемый цвет, комплектация, бюджет..."
                rows={3}
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-[13px] text-red">
                Ошибка отправки. Попробуйте ещё раз.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full h-12 bg-cta hover:bg-cta-hover text-white text-[15px] font-semibold rounded-xl transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Отправляем..." : "Отправить заявку"}
            </button>

            <p className="text-[12px] text-text-muted text-center">
              Нажимая кнопку, вы соглашаетесь на обработку персональных данных
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
