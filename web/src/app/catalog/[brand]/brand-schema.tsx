import type { BrandSEO } from "@/lib/brand-data";

export function generateBrandSchemas(seo: BrandSEO) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://encar.vechkasov.pro/" },
      { "@type": "ListItem", position: 2, name: "Каталог", item: "https://encar.vechkasov.pro/catalog/" },
      { "@type": "ListItem", position: 3, name: seo.nameRu, item: `https://encar.vechkasov.pro/catalog/${seo.slug}/` },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return { breadcrumb, faq };
}
