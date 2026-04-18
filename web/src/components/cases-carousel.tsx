function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

const cases = [
  {
    car: "Hyundai Tucson 2023",
    city: "Москва",
    days: 12,
    saving: "480 000 ₽",
  },
  {
    car: "Kia Sportage 2024",
    city: "Санкт-Петербург",
    days: 14,
    saving: "520 000 ₽",
  },
  {
    car: "Genesis G80 2022",
    city: "Новосибирск",
    days: 16,
    saving: "1 200 000 ₽",
  },
];

export function CasesCarousel() {
  return (
    <section id="cases" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-bold text-text-primary">
            Наши кейсы
          </h2>
          <p className="mt-3 text-[15px] text-text-secondary max-w-xl mx-auto">
            Реальные автомобили, которые мы уже доставили клиентам
          </p>
        </div>

        {/* Горизонтальный скролл на мобиле, grid на desktop */}
        <div className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto pb-2 lg:overflow-visible lg:pb-0 snap-x snap-mandatory">
          {cases.map((item) => (
            <div
              key={item.car}
              className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-auto bg-white shadow-sm border border-border rounded-2xl overflow-hidden snap-start"
            >
              {/* Placeholder фото */}
              <div className="h-44 bg-bg-surface flex items-center justify-center text-text-muted">
                <CameraIcon />
              </div>

              <div className="p-5">
                <p className="text-[16px] font-semibold text-text-primary">{item.car}</p>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Доставлен в {item.city}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-blue/10 text-blue text-[12px] font-medium">
                    {item.days} дней
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-green/10 text-green text-[12px] font-medium">
                    Экономия {item.saving}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
