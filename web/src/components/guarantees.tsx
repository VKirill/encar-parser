function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

const guarantees = [
  {
    Icon: ShieldIcon,
    title: "Юридическая чистота",
    description:
      "Проверяем историю ДТП, залоги, кредиты. Полный отчёт перед покупкой",
  },
  {
    Icon: RefreshIcon,
    title: "Страховка сделки",
    description:
      "Возврат средств, если автомобиль не соответствует описанию",
  },
  {
    Icon: DocumentIcon,
    title: "Официальная растаможка",
    description:
      "Все документы, ЭПТС, регистрация. Работаем по закону",
  },
  {
    Icon: LockIcon,
    title: "Фиксированная цена",
    description:
      "Стоимость фиксируется в момент заключения договора",
  },
];

export function Guarantees() {
  return (
    <section className="py-16 sm:py-20 bg-bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-bold text-text-primary">
            Наши гарантии
          </h2>
          <p className="mt-3 text-[15px] text-text-secondary max-w-xl mx-auto">
            Работаем прозрачно и берём ответственность на каждом этапе
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="bg-white shadow-sm border border-border rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                <Icon />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-text-primary">{title}</p>
                <p className="mt-1.5 text-[13px] text-text-secondary leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
