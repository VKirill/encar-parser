"use client";

import { useState } from "react";

export function RequestSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carInfo, setCarInfo] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

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
          comment: carInfo.trim(),
          carTitle: "Общая заявка",
        }),
      });

      if (resp.ok) {
        setStatus("sent");
        setName("");
        setPhone("");
        setCarInfo("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="request" className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Не нашли нужный автомобиль?
          </h2>
          <p className="text-[15px] text-text-secondary mt-3 mb-8">
            Оставьте заявку — мы подберём автомобиль по вашим параметрам
            и рассчитаем полную стоимость с доставкой в Россию
          </p>

          {status === "sent" ? (
            <div className="p-6 bg-green-soft border border-green/20 rounded-2xl">
              <p className="text-[16px] font-semibold text-green">
                Заявка отправлена!
              </p>
              <p className="text-[14px] text-text-secondary mt-1">
                Мы свяжемся с вами в ближайшее время
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full h-12 px-4 bg-bg-input border border-border rounded-xl text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
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
                    className="w-full h-12 px-4 bg-bg-input border border-border rounded-xl text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-text-secondary mb-1.5 font-medium">
                  Какой автомобиль ищете?
                </label>
                <textarea
                  value={carInfo}
                  onChange={(e) => setCarInfo(e.target.value)}
                  placeholder="Марка, модель, год, бюджет, пожелания по комплектации..."
                  rows={3}
                  className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {status === "error" && (
                <p className="text-[13px] text-red">
                  Ошибка отправки. Попробуйте позже.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full sm:w-auto h-12 px-8 bg-cta hover:bg-cta-hover text-white text-[15px] font-semibold rounded-xl transition-colors duration-150 cursor-pointer disabled:opacity-60"
              >
                {status === "sending"
                  ? "Отправляем..."
                  : "Отправить заявку"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
