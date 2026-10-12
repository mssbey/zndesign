// Digital inspiration palette, editable from /admin/fabrics. Verified supplier swatch
// photos can be uploaded per colour (`image`); the hex colour is the fallback.
export type FabricColor = { name: string; hex: string; image?: string };
export type FabricGroup = { name: string; slug: string; texture: string; note: string; colors: FabricColor[] };
export const FABRICS_KEY = "fabric-groups";
export const fabricTextures = [
  { value: "soft", label: "Yumuşak (düz)" },
  { value: "woven", label: "Dokuma" },
  { value: "woven fine", label: "İnce dokuma" },
  { value: "woven coarse", label: "Kalın dokuma" },
  { value: "loop", label: "İlmekli" },
  { value: "loop fine", label: "İnce ilmekli" },
  { value: "loop coarse", label: "Kalın ilmekli (bukle)" },
  { value: "plush", label: "Peluş" },
];
const palette: FabricColor[] = [
  { name: "Ekru", hex: "#e4dfd2" }, { name: "Kum Beji", hex: "#c4b398" },
  { name: "Taş", hex: "#a6a196" }, { name: "Vizon", hex: "#958475" },
  { name: "Adaçayı", hex: "#8a9481" }, { name: "Antrasit", hex: "#555956" },
];
export const fabricGroups: FabricGroup[] = [
  { name: "Baby Face", slug: "baby-face", texture: "soft", note: "Sakin tonlarla yumuşak bir görünüm.", colors: palette },
  { name: "Luna", slug: "luna", texture: "woven", note: "Yalın tasarımlara eşlik eden doğal tonlar.", colors: palette },
  { name: "Teddy", slug: "teddy", texture: "loop", note: "Sıcak bir atmosfer için dokulu bir yorum.", colors: palette },
  { name: "Puffy", slug: "puffy", texture: "plush", note: "Konfor hissini öne çıkaran bir renk dünyası.", colors: palette },
  { name: "Muzzy", slug: "muzzy", texture: "loop fine", note: "Dengeli renkler, sakin yaşam alanları.", colors: palette },
  { name: "Anka", slug: "anka", texture: "woven fine", note: "Zamansız tasarımlar için tamamlayıcı tonlar.", colors: palette },
  { name: "Coco", slug: "coco", texture: "woven coarse", note: "Doğal bir atmosfer için sıcak seçenekler.", colors: palette },
  { name: "Bukle", slug: "bukle", texture: "loop coarse", note: "Dokuya yer açan, karakterli bir görünüm.", colors: palette },
];
