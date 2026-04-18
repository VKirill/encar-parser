function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const members = [
  { name: "Менеджер", role: "Специалист по подбору" },
  { name: "Менеджер", role: "Специалист по подбору" },
  { name: "Менеджер", role: "Специалист по подбору" },
];

export function TeamBlock() {
  return (
    <section className="py-16 sm:py-20 bg-bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-bold text-text-primary">
            Наша команда
          </h2>
          <p className="mt-3 text-[15px] text-text-secondary max-w-xl mx-auto">
            Опытные специалисты помогут подобрать идеальный автомобиль
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto sm:max-w-none">
          {members.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-4 bg-white shadow-sm border border-border rounded-2xl p-8"
            >
              {/* Placeholder аватар */}
              <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center text-text-muted">
                <UserIcon />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-semibold text-text-primary">{member.name}</p>
                <p className="mt-1 text-[13px] text-text-secondary">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
