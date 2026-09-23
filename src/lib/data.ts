export const site = {
  name: "Zenn Bedding",
  tagline: "Uyku & Yaşam",
  address: "Cemal Gürsel Cad. No:3, Esenyurt / İstanbul",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905326791767",
  phone: process.env.NEXT_PUBLIC_PHONE || "+90 532 679 17 67",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenbedding.com.tr",
  logo: process.env.NEXT_PUBLIC_LOGO_PATH || "/images/logo.png",
  factoryImages: (process.env.NEXT_PUBLIC_FACTORY_IMAGES || "").split(",").map(s => s.trim()).filter(Boolean),
  factoryAddress: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "",
};
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
export const categories = [
  {
    slug: "bazalar",
    name: "Baza",
    image: "/images/base.webp",
    description: "Yaşam alanınız için sade ve kullanışlı alternatifler.",
  },
  {
    slug: "yatak-basliklari",
    name: "Başlık",
    image: "/images/headboard.webp",
    description: "Mekânın karakterini belirleyen dokular ve detaylar.",
  },
  {
    slug: "yataklar",
    name: "Yatak",
    image: "/images/mattress.webp",
    description: "Uyku alanınız için farklı ölçülerde seçenekler.",
  },
  {
    slug: "komodin",
    name: "Komodin",
    image: "/images/bedding.webp",
    description: "Yatağınızın yanında, günlük hayatınızı kolaylaştıran detaylar.",
  },
  {
    slug: "puf",
    name: "Puf",
    image: "/images/kids.webp",
    description: "Yaşam alanınızı tamamlayan yumuşak dokular ve özel ölçüler.",
  },
  { slug: "sehpa", name: "Sehpa", image: "/images/modern.webp", description: "Mekânınıza uyum sağlayan sade ve işlevsel tasarımlar." },
  { slug: "diger-urunler", name: "Diğer Ürünler", image: "/images/bedding.webp", description: "Yaşam alanınız için tamamlayıcı parçalar ve özel çözümler." },
];
export const collections = [
  {
    slug: "bohem-koleksiyon",
    name: "Bohem Koleksiyon",
    subtitle: "Az detay. Çok his.",
    description: "Doğal tonlar, yalın çizgiler ve dingin bir yaşam alanı.",
    image: "/images/hero.webp",
    demo: true,
  },
  {
    slug: "modern-koleksiyon",
    name: "Modern Koleksiyon",
    subtitle: "Mekânınıza yeni bir karakter.",
    description: "Belirgin çizgiler ve dokulu yüzeylerle modern bir yorum.",
    image: "/images/modern.webp",
    demo: true,
  },
  {
    slug: "kids-collection",
    name: "Kids Collection",
    subtitle: "Küçük hayallere büyük bir yer.",
    description: "Çocuk odaları için yumuşak tonlarla şekillenen bir dünya.",
    image: "/images/kids.webp",
    demo: true,
  },
  { slug: "luxury-koleksiyon", name: "Luxury Koleksiyon", subtitle: "Zarafetin incelikli yorumu.", description: "Zengin dokular ve özenli detaylarla şekillenen yaşam alanları.", image: "/images/headboard.webp", demo: true },
  { slug: "rustic-koleksiyon", name: "Rustic Koleksiyon", subtitle: "Doğallığın sıcaklığı.", description: "Toprak tonları, doğal görünümler ve zamansız bir sadelik.", image: "/images/hero.webp", demo: true },
  { slug: "yeni-koleksiyonlar", name: "Yeni Koleksiyonlar", subtitle: "Yeni tasarımlarla tanışın.", description: "Yaşam alanınıza yeni bir bakış getiren son modellerimiz.", image: "/images/modern.webp", demo: true },
].sort((a, b) => ["modern-koleksiyon", "luxury-koleksiyon", "bohem-koleksiyon", "rustic-koleksiyon", "kids-collection", "yeni-koleksiyonlar"].indexOf(a.slug) - ["modern-koleksiyon", "luxury-koleksiyon", "bohem-koleksiyon", "rustic-koleksiyon", "kids-collection", "yeni-koleksiyonlar"].indexOf(b.slug));
export const categoryAliases: Record<string, string> = { "baza-baslik-setleri": "bazalar", "uyku-setleri": "diger-urunler", kids: "diger-urunler" };
export const collectionAliases: Record<string, string> = { "sade-yasam": "bohem-koleksiyon", "modern-konfor": "modern-koleksiyon", "kids-dunyasi": "kids-collection" };
export type { Product } from "./db";
export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name || slug;
export const colorHex: Record<string, string> = {
  Krem: "#e7dfd1",
  Bej: "#b6a48c",
  Taş: "#a09d95",
  Antrasit: "#4b4b49",
};
