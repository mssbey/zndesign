import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/latin-ext-400.css";
import "@fontsource/cormorant-garamond/latin-ext-400-italic.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/manrope/latin-ext-400.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-ext-600.css";
import "@fontsource/manrope/latin-600.css";
import "./globals.css";
import { site } from "@/lib/data";
export const metadata: Metadata = {
  title: { default: "Zenn Bedding | Uyku & Yaşam", template: "%s | Zenn Bedding" },
  description:
    "Zenn Bedding: kendi tesisimizde ürettiğimiz baza, başlık ve yataklar. Özel ölçü, kumaş ve renk seçeneklerini keşfedin; üretimi yerinde görün, birlikte tasarlayalım.",
  ...(site.domain ? { metadataBase: new URL(site.domain) } : {}),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FurnitureStore",
              name: site.name,
              address: site.address,
              ...(site.domain ? { url: site.domain } : {}),
            }).replace(/</g, "\u003c"),
          }}
        />
      </body>
    </html>
  );
}
