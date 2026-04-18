import { fetchCars, MANUFACTURER_LABELS } from "@/lib/encar-api";
import { getCarsWithBooked, getAllCars, getTotalOnEncar } from "@/lib/car-store";
import { Hero } from "@/components/hero";
import { ProcessSteps } from "@/components/process-steps";
import { CarListing } from "@/components/car-listing";
import { BrandsGrid } from "@/components/brands-grid";
import { CalculatorBlock } from "@/components/calculator-block";
import { CasesCarousel } from "@/components/cases-carousel";
import { Guarantees } from "@/components/guarantees";
import { TeamBlock } from "@/components/team-block";
import { FaqSection } from "@/components/faq-section";
import { RequestSection } from "@/components/request-section";

/* ────────────────────────────────────────────
   Блок: Сравнение цен Корея vs Россия
   ──────────────────────────────────────────── */
const PRICE_COMPARISON = [
  { model: "Hyundai Tucson 2023", korea: "от 1,8 млн ₽", russia: "3,5–4,2 млн ₽", save: "до 55%" },
  { model: "KIA Sportage 2023", korea: "от 1,7 млн ₽", russia: "3,3–4,0 млн ₽", save: "до 50%" },
  { model: "Hyundai Santa Fe 2023", korea: "от 2,2 млн ₽", russia: "4,5–5,5 млн ₽", save: "до 50%" },
  { model: "Genesis GV70 2023", korea: "от 3,0 млн ₽", russia: "5,5–7,0 млн ₽", save: "до 45%" },
  { model: "KIA K5 2023", korea: "от 1,5 млн ₽", russia: "3,0–3,5 млн ₽", save: "до 50%" },
];

/* ────────────────────────────────────────────
   Блок: Почему Корея, а не Китай
   ──────────────────────────────────────────── */
const KOREA_VS_CHINA = [
  { feature: "Потеря стоимости за 3 года", korea: "25–30%", china: "40–50%", winner: "korea" },
  { feature: "Безопасность (NCAP)", korea: "5 звёзд", china: "3–4 звезды", winner: "korea" },
  { feature: "Качество ЛКП и сборки", korea: "Проверено десятилетиями", china: "Жалобы на коррозию", winner: "korea" },
  { feature: "Доступность запчастей в РФ", korea: "Огромный рынок", china: "Ограничен", winner: "korea" },
  { feature: "Ликвидность при перепродаже", korea: "Высокая", china: "Низкая", winner: "korea" },
];

/* ────────────────────────────────────────────
   FAQ — адаптировано под боли российского рынка
   ──────────────────────────────────────────── */
const MAIN_FAQ = [
  {
    question: "Сколько реально стоит пригнать авто из Кореи «под ключ»?",
    answer:
      "Итоговая стоимость = цена авто в Корее + таможенная пошлина (зависит от объёма двигателя и года) + утильсбор + доставка + наша комиссия. В среднем это +15-25% к корейской цене. Но даже с учётом всех расходов экономия составляет 30-50% от цен российского рынка. Tucson 2023 обойдётся в 1,8-2,2 млн ₽ — против 3,5-4,2 млн у дилеров в РФ.",
  },
  {
    question: "А если курс изменится пока авто в пути?",
    answer:
      "Цена фиксируется в договоре в момент подписания. Мы берём курсовые риски на себя. Вы платите ровно ту сумму, которая указана в договоре — без доплат и сюрпризов.",
  },
  {
    question: "Как вы проверяете авто? Не привезут ли битое/утопленное?",
    answer:
      "Каждый автомобиль проходит 3 уровня проверки: 1) история ДТП по страховым базам Кореи, 2) техническая диагностика на площадке Encar, 3) видеоосмотр с комментариями нашего специалиста. Вы получаете полный отчёт ДО оплаты. Если авто не соответствует — отказываемся и ищем другой вариант.",
  },
  {
    question: "Какие документы нужны? Смогу ли я поставить авто на учёт?",
    answer:
      "От вас — только паспорт РФ. Мы оформляем: ЭПТС (электронный ПТС), таможенную декларацию, свидетельство о безопасности конструкции (СБКТС). Автомобиль ставится на учёт в ГИБДД без проблем. Гарантируем постановку на учёт или возврат денег.",
  },
  {
    question: "Почему корейское авто лучше нового китайского?",
    answer:
      "За один и тот же бюджет 2-2,5 млн ₽ можно взять базовый Chery Tiggo (без истории надёжности, -50% стоимости через 3 года) или проверенный Hyundai Tucson 2023 с пробегом 30 000 км (-25% через 3 года). Корейские авто лидируют по безопасности (5 звёзд NCAP), качеству ЛКП, надёжности электроники и ликвидности при перепродаже.",
  },
  {
    question: "Сколько времени занимает весь процесс?",
    answer:
      "Подбор: 1-3 дня. Проверка и покупка: 1-2 дня. Морская доставка Инчхон → Владивосток: 5-7 дней. Таможня и оформление: 2-3 дня. Доставка по России: 3-14 дней. Итого: 2-4 недели от заявки до ключей в руках.",
  },
  {
    question: "А что с гарантией и сервисом?",
    answer:
      "Hyundai и KIA — самые распространённые марки в России, запчасти есть везде. На многие авто действует заводская гарантия производителя. Мы предоставляем юридическую гарантию: если авто не соответствует описанию — полный возврат средств.",
  },
];

export default async function HomePage() {
  // Читаем из локальной БД; если пуста — fallback на API
  let storeCars = getCarsWithBooked(8);
  let storeAll = getAllCars();
  const totalOnEncar = getTotalOnEncar();

  let cars: (typeof storeCars[number])[] = storeCars;
  let allCars: (typeof storeAll[number])[] = storeAll;

  if (storeAll.length === 0) {
    const [carsResult, allCarsResult] = await Promise.all([
      fetchCars({ limit: 8 }),
      fetchCars({ limit: 200 }),
    ]);
    cars = carsResult.cars.map((c) => ({ ...c, status: "active" as const }));
    allCars = allCarsResult.cars.map((c) => ({ ...c, status: "active" as const }));
  }

  const brandCounts: Record<string, number> = {};
  for (const car of allCars) {
    if (car.manufacturerKey) {
      brandCounts[car.manufacturerKey] =
        (brandCounts[car.manufacturerKey] || 0) + 1;
    }
  }
  const brands = Object.entries(brandCounts)
    .map(([slug, count]) => ({
      slug,
      label: MANUFACTURER_LABELS[slug] ?? slug,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <main>
      <Hero totalOnEncar={totalOnEncar} />

      {/* ── Боль: Сколько вы переплачиваете ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Сколько вы <span className="text-cta">переплачиваете</span> за авто в России
          </h2>
          <p className="text-[15px] text-text-secondary mt-3 max-w-2xl mx-auto">
            Средняя наценка дилеров и перекупов в РФ — от 30 до 80%.
            Те же автомобили напрямую из Кореи стоят значительно дешевле даже с учётом таможни и доставки.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface text-[13px] text-text-muted uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">Модель</th>
                  <th className="text-left px-6 py-3 font-medium">Из Кореи под ключ</th>
                  <th className="text-left px-6 py-3 font-medium">В России</th>
                  <th className="text-left px-6 py-3 font-medium">Экономия</th>
                </tr>
              </thead>
              <tbody>
                {PRICE_COMPARISON.map((row, i) => (
                  <tr key={row.model} className={i % 2 === 0 ? "" : "bg-bg-surface/50"}>
                    <td className="px-6 py-4 text-[14px] font-medium text-text-primary">{row.model}</td>
                    <td className="px-6 py-4 text-[14px] font-semibold text-accent">{row.korea}</td>
                    <td className="px-6 py-4 text-[14px] text-text-secondary line-through">{row.russia}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-green-soft text-green text-[13px] font-semibold rounded-lg">
                        {row.save}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-border">
            {PRICE_COMPARISON.map((row) => (
              <div key={row.model} className="p-4">
                <p className="text-[14px] font-medium text-text-primary">{row.model}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[15px] font-semibold text-accent">{row.korea}</span>
                  <span className="text-[13px] text-text-muted line-through">{row.russia}</span>
                  <span className="px-2 py-0.5 bg-green-soft text-green text-[12px] font-semibold rounded">
                    {row.save}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="#calculator"
            className="inline-flex items-center h-12 px-8 bg-cta hover:bg-cta-hover text-white text-[15px] font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Рассчитать для вашего авто
          </a>
        </div>
      </section>

      {/* ── Процесс работы ── */}
      <section id="process">
        <ProcessSteps />
      </section>

      {/* ── Превью каталога ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              Автомобили из Кореи прямо сейчас
            </h2>
            <p className="text-[14px] text-text-secondary mt-1">
              Актуальные предложения. Цены обновляются каждые 10 минут.
            </p>
          </div>
          <a
            href="/catalog"
            className="text-[14px] text-accent hover:text-accent-hover font-medium cursor-pointer transition-colors"
          >
            Весь каталог →
          </a>
        </div>
        <CarListing cars={cars} />
      </section>

      {/* ── Популярные марки ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
          Популярные марки из Кореи
        </h2>
        <BrandsGrid brands={brands} />
      </section>

      {/* ── Почему Корея, а не Китай ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Почему Корея, а не Китай?
          </h2>
          <p className="text-[15px] text-text-secondary mt-3 max-w-2xl mx-auto">
            Многие рассматривают китайские авто как альтернативу.
            Но за тот же бюджет корейский автомобиль выигрывает по всем параметрам.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-surface text-[13px] text-text-muted uppercase tracking-wider">
                <th className="text-left px-4 sm:px-6 py-3 font-medium">Параметр</th>
                <th className="text-left px-4 sm:px-6 py-3 font-medium text-accent">Корея</th>
                <th className="text-left px-4 sm:px-6 py-3 font-medium">Китай</th>
              </tr>
            </thead>
            <tbody>
              {KOREA_VS_CHINA.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? "" : "bg-bg-surface/50"}>
                  <td className="px-4 sm:px-6 py-3.5 text-[13px] sm:text-[14px] text-text-secondary">{row.feature}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-[13px] sm:text-[14px] font-semibold text-accent">{row.korea}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-[13px] sm:text-[14px] text-text-muted">{row.china}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Калькулятор ── */}
      <section id="calculator">
        <CalculatorBlock />
      </section>

      {/* ── Кейсы ── */}
      <section id="cases">
        <CasesCarousel />
      </section>

      {/* ── Гарантии ── */}
      <Guarantees />

      {/* ── Команда ── */}
      <TeamBlock />

      {/* ── FAQ ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Ответы на ваши вопросы
          </h2>
          <p className="text-[14px] text-text-secondary mt-2">
            Разбираем главные сомнения при покупке авто из Кореи
          </p>
        </div>
        <FaqSection items={MAIN_FAQ} />
      </section>

      {/* ── Форма заявки ── */}
      <RequestSection />
    </main>
  );
}
