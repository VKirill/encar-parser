interface Brand {
  slug: string;
  label: string;
  count: number;
}

interface BrandsGridProps {
  brands: Brand[];
}

export function BrandsGrid({ brands }: BrandsGridProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-[24px] sm:text-[32px] font-bold text-text-primary">
            Популярные марки
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {brands.map((brand) => (
            <a
              key={brand.slug}
              href={`/catalog/${brand.slug}/`}
              className="bg-bg-card border border-border hover:border-accent hover:shadow-md rounded-xl p-4 flex flex-col gap-1.5 transition-all duration-150 cursor-pointer group"
              style={{ minHeight: 44 }}
            >
              <span className="text-[15px] font-semibold text-text-primary group-hover:text-accent transition-colors duration-150">
                {brand.label}
              </span>
              <span className="text-[12px] text-text-muted">
                {brand.count.toLocaleString("ru-RU")} авто
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
