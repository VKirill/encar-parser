const steps = [
  {
    number: 1,
    title: "Подбор",
    description: "Подбираем авто по вашим параметрам на площадке Encar",
    duration: "1-2 дня",
  },
  {
    number: 2,
    title: "Проверка",
    description: "Диагностика, проверка истории ДТП и юридической чистоты",
    duration: "1 день",
  },
  {
    number: 3,
    title: "Покупка",
    description: "Покупаем авто после вашего одобрения",
    duration: "1 день",
  },
  {
    number: 4,
    title: "Доставка",
    description: "Морская доставка из Кореи во Владивосток",
    duration: "7-10 дней",
  },
  {
    number: 5,
    title: "Растаможка и выдача",
    description: "Оформляем ЭПТС, таможню. Доставка в ваш город",
    duration: "2-3 дня",
  },
];

export function ProcessSteps() {
  return (
    <section id="process" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-[28px] sm:text-[36px] font-bold text-text-primary">
            Как мы работаем
          </h2>
          <p className="mt-3 text-[15px] text-text-secondary max-w-xl mx-auto">
            Полное сопровождение от подбора автомобиля до передачи ключей
          </p>
        </div>

        {/* Desktop: горизонтальный таймлайн */}
        <div className="hidden lg:flex items-start gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-start flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Номер */}
                <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-[15px] font-bold text-white">{step.number}</span>
                </div>

                {/* Контент */}
                <div className="mt-4 text-center px-2">
                  <p className="text-[14px] font-semibold text-text-primary">{step.title}</p>
                  <p className="mt-1.5 text-[12px] text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-medium">
                    {step.duration}
                  </span>
                </div>
              </div>

              {/* Пунктирная линия между шагами */}
              {index < steps.length - 1 && (
                <div
                  className="mt-5 flex-shrink-0 w-8"
                  aria-hidden="true"
                >
                  <svg width="32" height="2" viewBox="0 0 32 2">
                    <line
                      x1="0" y1="1" x2="32" y2="1"
                      stroke="#E5E7EB"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: вертикальный таймлайн */}
        <div className="lg:hidden flex flex-col gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-4">
              {/* Линия слева */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-[14px] font-bold text-white">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 w-px mt-2 mb-2" style={{ borderLeft: "1.5px dashed #E5E7EB" }} aria-hidden="true" />
                )}
              </div>

              {/* Контент */}
              <div className={`pb-6 ${index === steps.length - 1 ? "" : ""}`}>
                <p className="text-[15px] font-semibold text-text-primary mt-2">{step.title}</p>
                <p className="mt-1 text-[13px] text-text-secondary leading-relaxed">
                  {step.description}
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-medium">
                  {step.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
