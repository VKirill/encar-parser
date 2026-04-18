import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { TrustBar } from "@/components/trust-bar";
import { Footer } from "@/components/footer";
import { FloatingMessenger } from "@/components/floating-messenger";

export const metadata: Metadata = {
  title: "EncarKorea — Пригон авто из Кореи с экономией до 30%",
  description:
    "Подбор, проверка и доставка автомобилей с крупнейшей площадки Южной Кореи. Hyundai, Kia, Genesis и другие марки. Полное юридическое сопровождение.",
  openGraph: {
    title: "EncarKorea — Пригон авто из Кореи с экономией до 30%",
    description:
      "Подбор, проверка и доставка автомобилей с крупнейшей площадки Южной Кореи. Вы платите только после полной проверки.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "EncarKorea",
              url: "https://encar.vechkasov.pro",
              description: "Подбор и пригон автомобилей из Южной Кореи в Россию",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                availableLanguage: "Russian",
              },
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <TrustBar />
        <Header />
        {children}
        <Footer />
        <FloatingMessenger />
      </body>
    </html>
  );
}
