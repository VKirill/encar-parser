import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCarById, fetchCars, MANUFACTURER_LABELS } from "@/lib/encar-api";
import { getCarById, getCarsByBrand } from "@/lib/car-store";
import { getBrandSEO } from "@/lib/brand-data";
import { CarGallery } from "@/components/car-gallery";
import { PricePanel } from "@/components/price-panel";
import { RequestSection } from "@/components/request-section";
import { SimilarCarsGrid } from "./similar-cars-grid";
import { generateVehicleSchema } from "./schema";

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; carId: string }>;
}): Promise<Metadata> {
  const { brand, carId } = await params;
  const car = getCarById(carId) ?? await fetchCarById(carId, brand);
  if (!car) return {};
  const brandLabel = MANUFACTURER_LABELS[brand] ?? brand;
  return {
    title: `${brandLabel} ${car.model} ${car.formYear} — купить из Кореи | EncarKorea`,
    description: `${brandLabel} ${car.model} ${car.formYear}, ${formatPrice(car.mileageKm)} км, ${car.fuelTypeRu}. Цена ~${formatPrice(car.priceRUB)} RUB. Доставка 7–14 дней.`,
  };
}

export default async function CarPage({
  params,
}: {
  params: Promise<{ brand: string; carId: string }>;
}) {
  const { brand, carId } = await params;

  // Ищем сначала в локальной БД, fallback на API
  const car = getCarById(carId) ?? await fetchCarById(carId, brand);

  // Похожие авто — из store если есть данные, иначе API
  const storeBrandCars = getCarsByBrand(brand);
  const brandCars = storeBrandCars.length > 0
    ? storeBrandCars.slice(0, 8)
    : (await fetchCars({ manufacturer: brand, limit: 8 })).cars;

  if (!car) {
    const brandLabel = MANUFACTURER_LABELS[brand] ?? brand;
    return (
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-3">
            Объявление больше недоступно
          </h1>
          <p className="text-[15px] text-text-secondary mb-8 max-w-md mx-auto">
            Автомобиль мог быть продан или снят с публикации. Посмотрите похожие {brandLabel} из Кореи.
          </p>
          <a href={`/catalog/${brand}`} className="inline-flex h-11 px-6 bg-cta hover:bg-cta-hover text-white text-[14px] font-semibold rounded-xl items-center cursor-pointer transition-colors">
            Смотреть {brandLabel}
          </a>
          {brandCars.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-text-primary mb-6">Другие {brandLabel} из Кореи</h2>
              <SimilarCarsGrid cars={brandCars.slice(0, 4)} />
            </div>
          )}
        </div>
      </main>
    );
  }

  const brandLabel = MANUFACTURER_LABELS[brand] ?? car.manufacturer;
  const seo = getBrandSEO(brand);

  const similarCars = brandCars.filter((c) => c.id !== car.id).slice(0, 4);

  const specs: { label: string; value: string }[] = [
    { label: "Марка", value: brandLabel },
    { label: "Модель", value: car.model },
    { label: "Год выпуска", value: car.formYear },
    { label: "Пробег", value: `${formatPrice(car.mileageKm)} км` },
    { label: "Двигатель", value: car.badge || "—" },
    { label: "Комплектация", value: car.badgeDetail || "—" },
    { label: "Коробка передач", value: car.transmissionRu || "—" },
    { label: "Топливо", value: car.fuelTypeRu || "—" },
    { label: "Тип продажи", value: car.sellType || "—" },
    { label: "Город", value: car.officeCity || "—" },
    { label: "Дилер", value: car.dealerName || car.officeName || "—" },
  ];

  const totalPrice = car.priceRUB + Math.round(car.priceRUB * 0.15) + 780000;

  const conditionBadges = [
    car.condition.includes("Inspection") && {
      key: "inspection",
      bg: "bg-green-soft",
      stroke: "#16A34A",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" aria-hidden="true">
          <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
        </svg>
      ),
      title: "Прошёл инспекцию",
      sub: "Техническая диагностика Encar",
    },
    car.condition.includes("Record") && {
      key: "record",
      bg: "bg-blue-soft",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
        </svg>
      ),
      title: "Есть записи обслуживания",
      sub: "Сервисная история доступна",
    },
    car.trust.includes("ExtendWarranty") && {
      key: "warranty",
      bg: "bg-amber-soft",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" aria-hidden="true">
          <path d="M12 2L3.5 6.5v5C3.5 16.6 7 21 12 22c5-1 8.5-5.4 8.5-10.5v-5L12 2z" />
        </svg>
      ),
      title: "Расширенная гарантия",
      sub: "Гарантия от площадки Encar",
    },
    car.trust.includes("HomeService") && {
      key: "home",
      bg: "bg-accent-soft",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      ),
      title: "Доставка до дома",
      sub: "Можно заказать с доставкой",
    },
    car.condition.includes("Resume") && {
      key: "resume",
      bg: "bg-bg-surface",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" /><path d="M9 21V9" />
        </svg>
      ),
      title: "Полное резюме",
      sub: "Подробная история авто",
    },
  ].filter(Boolean) as Array<{
    key: string;
    bg: string;
    icon: React.ReactNode;
    title: string;
    sub: string;
  }>;

  const hasConditionBadges = conditionBadges.length > 0;

  return (
    <main>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateVehicleSchema(car, brandLabel)) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Хлебные крошки */}
        <nav
          className="flex items-center gap-2 text-[13px] text-text-secondary mb-6 overflow-x-auto whitespace-nowrap"
          aria-label="Хлебные крошки"
        >
          <a href="/" className="hover:text-text-primary transition-colors cursor-pointer">
            Главная
          </a>
          <span className="text-text-muted" aria-hidden="true">/</span>
          <a
            href="/catalog/"
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Каталог
          </a>
          <span className="text-text-muted" aria-hidden="true">/</span>
          <a
            href={`/catalog/${brand}/`}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            {brandLabel}
          </a>
          <span className="text-text-muted" aria-hidden="true">/</span>
          <span className="text-text-primary">
            {car.model} {car.formYear}
          </span>
        </nav>

        {/* Заголовок */}
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
          {brandLabel} {car.model} {car.formYear}
        </h1>

        {/* Основной контент: 2 колонки */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 mb-8">
          {/* LEFT: Галерея */}
          <div>
            <CarGallery
              photos={car.photos.length ? car.photos : car.photoUrl ? [car.photoUrl] : []}
              alt={`${brandLabel} ${car.model} ${car.formYear}`}
            />
          </div>

          {/* RIGHT: Sticky price panel */}
          <div>
            <PricePanel priceRUB={car.priceRUB} priceKRW={car.priceKRW} />
          </div>
        </div>

        {/* Преимущества */}
        {(car.mileageKm < 50000 ||
          car.year >= 2023 ||
          car.condition.includes("Inspection") ||
          car.trust.includes("ExtendWarranty") ||
          car.fuelTypeRu === "Электро" ||
          car.fuelTypeRu === "Гибрид") && (
          <div className="bg-white border border-border rounded-2xl p-6 mb-8">
            <h2 className="text-[16px] font-semibold text-text-primary mb-4">
              Почему стоит обратить внимание
            </h2>
            <div className="flex flex-wrap gap-2">
              {car.mileageKm < 50000 && (
                <span className="px-3 py-1.5 bg-green-soft text-green text-[13px] font-medium rounded-lg">
                  Небольшой пробег
                </span>
              )}
              {car.year >= 2023 && (
                <span className="px-3 py-1.5 bg-accent-soft text-accent text-[13px] font-medium rounded-lg">
                  Свежий год выпуска
                </span>
              )}
              {car.condition.includes("Inspection") && (
                <span className="px-3 py-1.5 bg-blue-soft text-blue text-[13px] font-medium rounded-lg">
                  Проверен на площадке
                </span>
              )}
              {car.trust.includes("ExtendWarranty") && (
                <span className="px-3 py-1.5 bg-amber-soft text-amber text-[13px] font-medium rounded-lg">
                  С гарантией
                </span>
              )}
              {car.fuelTypeRu === "Электро" && (
                <span className="px-3 py-1.5 bg-green-soft text-green text-[13px] font-medium rounded-lg">
                  Электромобиль
                </span>
              )}
              {car.fuelTypeRu === "Гибрид" && (
                <span className="px-3 py-1.5 bg-blue-soft text-blue text-[13px] font-medium rounded-lg">
                  Гибрид — экономичный
                </span>
              )}
            </div>
          </div>
        )}

        {/* Стоимость под ключ */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-[16px] font-semibold text-text-primary mb-4">
            Примерная стоимость под ключ
          </h2>
          <div className="space-y-3">
            {[
              { label: "Автомобиль в Корее", value: car.priceRUB },
              { label: "Таможенная пошлина", value: Math.round(car.priceRUB * 0.15) },
              { label: "Утилизационный сбор", value: 500000 },
              { label: "Доставка (море + Россия)", value: 200000 },
              { label: "Оформление документов", value: 80000 },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-[14px] text-text-secondary">{item.label}</span>
                <span className="text-[14px] text-text-primary font-medium">
                  {formatPrice(item.value)} ₽
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
              <span className="text-[15px] font-semibold text-text-primary">Итого под ключ</span>
              <span className="text-[18px] font-bold text-accent">
                ~{formatPrice(totalPrice)} ₽
              </span>
            </div>
          </div>
          <p className="text-[12px] text-text-muted mt-3">
            * Расчёт приблизительный. Точная стоимость зависит от объёма двигателя, года выпуска и города доставки.
            Оставьте заявку для точного расчёта.
          </p>
        </div>

        {/* Состояние и проверки */}
        {hasConditionBadges && (
          <div className="bg-white border border-border rounded-2xl p-6 mb-8">
            <h2 className="text-[16px] font-semibold text-text-primary mb-4">
              Состояние и проверки
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conditionBadges.map((badge) => (
                <div key={badge.key} className={`flex items-center gap-2.5 p-3 ${badge.bg} rounded-xl`}>
                  {badge.icon}
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{badge.title}</p>
                    <p className="text-[12px] text-text-muted">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Описание */}
        <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-[16px] font-semibold text-text-primary mb-3">
            Об автомобиле
          </h2>
          <p className="text-[14px] text-text-secondary leading-relaxed">
            {brandLabel} {car.model} {car.formYear} года с пробегом{" "}
            {formatPrice(car.mileageKm)} км. {car.fuelTypeRu},{" "}
            {car.transmissionRu}. Автомобиль проверен на площадке Encar.
            {seo ? ` ${seo.nameRu} — надёжный выбор для тех, кто ценит качество и экономию.` : ""}
          </p>
        </div>

        {/* Характеристики */}
        <div className="mb-12">
          <h2 className="text-[18px] font-bold text-text-primary mb-4">
            Характеристики
          </h2>
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <tbody>
                {specs.map((spec, i) => (
                  <tr
                    key={spec.label}
                    className={i % 2 === 0 ? "bg-bg-surface/40" : ""}
                  >
                    <td className="px-4 py-2.5 text-[13px] text-text-secondary w-1/2 border-b border-border">
                      {spec.label}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-text-primary font-medium border-b border-border">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Похожие авто */}
        {similarCars.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[18px] font-bold text-text-primary mb-6">
              Похожие {brandLabel}
            </h2>
            <SimilarCarsGrid cars={similarCars} />
          </div>
        )}
      </div>

      <RequestSection />
    </main>
  );
}
