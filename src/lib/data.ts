export const site = {
  name: "ZN Design",
  tagline: "Uyku & Yaşam",
  address: "Cemal Gürsel Cad. No:3, Esenyurt / İstanbul",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  phone: process.env.NEXT_PUBLIC_PHONE || "",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "",
  logo: process.env.NEXT_PUBLIC_LOGO_PATH || "",
};
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
export const categories = [
  {
    slug: "baza-baslik-setleri",
    name: "Baza & Başlık Setleri",
    image: "/images/hero.webp",
    description:
      "Birbirini tamamlayan çizgiler, yatak odanızda dengeli bir bütün.",
  },
  {
    slug: "bazalar",
    name: "Bazalar",
    image: "/images/base.webp",
    description: "Yaşam alanınız için sade ve kullanışlı alternatifler.",
  },
  {
    slug: "yatak-basliklari",
    name: "Yatak Başlıkları",
    image: "/images/headboard.webp",
    description: "Mekânın karakterini belirleyen dokular ve detaylar.",
  },
  {
    slug: "yataklar",
    name: "Yataklar",
    image: "/images/mattress.webp",
    description: "Uyku alanınız için farklı ölçülerde seçenekler.",
  },
  {
    slug: "uyku-setleri",
    name: "Uyku Setleri",
    image: "/images/bedding.webp",
    description: "Yatak odanızın atmosferini tamamlayan yumuşak dokular.",
  },
  {
    slug: "kids",
    name: "Kids / Çocuk Serisi",
    image: "/images/kids.webp",
    description: "Küçük dünyalar için sakin renkler ve sıcak detaylar.",
  },
];
export const collections = [
  {
    slug: "sade-yasam",
    name: "Sade Yaşam",
    subtitle: "Az detay. Çok his.",
    description: "Doğal tonlar, yalın çizgiler ve dingin bir yaşam alanı.",
    image: "/images/hero.webp",
    demo: true,
  },
  {
    slug: "modern-konfor",
    name: "Modern Konfor",
    subtitle: "Mekânınıza yeni bir karakter.",
    description: "Belirgin çizgiler ve dokulu yüzeylerle modern bir yorum.",
    image: "/images/modern.webp",
    demo: true,
  },
  {
    slug: "kids-dunyasi",
    name: "Kids Dünyası",
    subtitle: "Küçük hayallere büyük bir yer.",
    description: "Çocuk odaları için yumuşak tonlarla şekillenen bir dünya.",
    image: "/images/kids.webp",
    demo: true,
  },
];
export type { Product } from "./db";
export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name || slug;
export const colorHex: Record<string, string> = {
  Krem: "#e7dfd1",
  Bej: "#b6a48c",
  Taş: "#a09d95",
  Antrasit: "#4b4b49",
};
