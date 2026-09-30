import { neon } from "@neondatabase/serverless";

export type Slide = { title: string; second: string; text: string; image: string; href: string; label: string };
export const defaultSlides: Slide[] = [
  { title: "Sade Yaşam –", second: "Doğal Konfor.", text: "Yumuşak dokular, yalın çizgiler. Yatak odanız için zamansız bir dokunuş.", image: "/images/hero.webp", href: "/koleksiyonlar/bohem-koleksiyon", label: "Bohem Koleksiyon" },
  { title: "Modern –", second: "Yaşam Alanları.", text: "Güçlü çizgiler ve özenle seçilmiş kumaşlarla yaşam alanınıza yeni bir karakter.", image: "/images/modern.webp", href: "/koleksiyonlar/modern-koleksiyon", label: "Modern Koleksiyon" },
  { title: "Küçük Hayaller –", second: "Büyük Konfor.", text: "Çocuk odaları için sıcak detaylar, sakin renkler ve konforlu seçenekler.", image: "/images/kids.webp", href: "/koleksiyonlar/kids-collection", label: "Kids Collection" },
];
const sql = neon(process.env.DATABASE_URL!);
let init: Promise<unknown> | undefined;
async function ready() {
  init ??= sql.query("CREATE TABLE IF NOT EXISTS home_slides (id INTEGER PRIMARY KEY, image TEXT NOT NULL)")
    .catch(error => { init = undefined; throw error; });
  await init;
}
/** Default slides with any admin-uploaded images applied. */
export async function getSlides(): Promise<Slide[]> {
  await ready();
  const rows = await sql.query("SELECT id, image FROM home_slides") as { id: number; image: string }[];
  const images = new Map(rows.map(row => [row.id, row.image]));
  return defaultSlides.map((slide, i) => ({ ...slide, image: images.get(i) ?? slide.image }));
}
export async function setSlideImage(id: number, image: string) {
  await ready();
  await sql.query("INSERT INTO home_slides (id, image) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET image = EXCLUDED.image", [id, image]);
}
export async function resetSlideImage(id: number) {
  await ready();
  await sql.query("DELETE FROM home_slides WHERE id = $1", [id]);
}
