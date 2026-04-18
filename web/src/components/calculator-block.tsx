"use client";

import { useState, useCallback } from "react";

const ENGINE_VOLUMES = [
  { value: "1.0", label: "1.0L" },
  { value: "1.4", label: "1.4L" },
  { value: "1.6", label: "1.6L" },
  { value: "2.0", label: "2.0L" },
  { value: "2.5", label: "2.5L" },
  { value: "3.0", label: "3.0L" },
  { value: "3.3", label: "3.3L" },
  { value: "3.5", label: "3.5L" },
  { value: "4.0", label: "4.0L+" },
];

const YEARS = Array.from({ length: 7 }, (_, i) => 2026 - i);

const FUEL_TYPES = [
  { value: "petrol", label: "Бензин" },
  { value: "diesel", label: "Дизель" },
  { value: "hybrid", label: "Гибрид" },
  { value: "electric", label: "Электро" },
];

const KRW_TO_RUB = 0.063;
const DUTY_RATE = 0.15;
const EPTS_UTIL = 500_000;
const DELIVERY = 200_000;
const COMMISSION = 100_000;

interface CalcResult {
  carRub: number;
  duty: number;
  eptsUtil: number;
  delivery: number;
  commission: number;
  total: number;
}

function formatRub(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function calcBreakdown(priceKrw: number): CalcResult | null {
  if (!priceKrw || priceKrw <= 0) return null;
  const carRub = Math.round(priceKrw * KRW_TO_RUB);
  const duty = Math.round(carRub * DUTY_RATE);
  const total = carRub + duty + EPTS_UTIL + DELIVERY + COMMISSION;
  return { carRub, duty, eptsUtil: EPTS_UTIL, delivery: DELIVERY, commission: COMMISSION, total };
}

const inputClass =
  "w-full bg-bg-input border border-border hover:border-border-hover focus:border-accent rounded-xl px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-150 cursor-pointer";

export function CalculatorBlock() {
  const [priceKrw, setPriceKrw] = useState<string>("");
  const [engineVolume, setEngineVolume] = useState<string>("2.0");
  const [year, setYear] = useState<string>(String(2023));
  const [fuelType, setFuelType] = useState<string>("petrol");

  const result = calcBreakdown(Number(priceKrw));

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      setPriceKrw(raw);
    },
    []
  );

  function scrollToRequest(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="calculator" className="py-16 sm:py-20 bg-bg-surface">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-bold text-text-primary">
            Калькулятор растаможки
          </h2>
          <p className="mt-3 text-[15px] text-text-secondary">
            Оцените примерную стоимость с учётом всех расходов
          </p>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
          {/* Поля ввода */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                Цена автомобиля (KRW)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Например: 30 000 000"
                value={priceKrw ? Number(priceKrw).toLocaleString("ru-RU") : ""}
                onChange={handlePriceChange}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  Объём двигателя
                </label>
                <select
                  value={engineVolume}
                  onChange={(e) => setEngineVolume(e.target.value)}
                  className={inputClass}
                >
                  {ENGINE_VOLUMES.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  Год выпуска
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={inputClass}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  Тип топлива
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className={inputClass}
                >
                  {FUEL_TYPES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Разбивка */}
          {result && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="divide-y divide-border">
                {[
                  { label: "Автомобиль (в рублях)", value: result.carRub },
                  { label: "Таможенная пошлина (~15%)", value: result.duty },
                  { label: "ЭПТС + утильсбор", value: result.eptsUtil },
                  { label: "Доставка", value: result.delivery },
                  { label: "Комиссия", value: result.commission },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-text-secondary">{label}</span>
                    <span className="text-[13px] font-medium text-text-primary">{formatRub(value)}</span>
                  </div>
                ))}

                <div className="flex items-center justify-between px-4 py-3.5 bg-accent/5">
                  <span className="text-[14px] font-semibold text-text-primary">ИТОГО</span>
                  <span className="text-[16px] font-bold text-accent">{formatRub(result.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <a
            href="#request"
            onClick={scrollToRequest}
            className="flex items-center justify-center h-12 rounded-xl bg-cta hover:bg-cta-hover text-white text-[15px] font-semibold transition-colors duration-150 cursor-pointer"
          >
            Получить точный расчёт
          </a>

          <p className="text-[11px] text-text-muted text-center leading-relaxed">
            Расчёт приблизительный. Для точной стоимости оставьте заявку.
          </p>
        </div>
      </div>
    </section>
  );
}
