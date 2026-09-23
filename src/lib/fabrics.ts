// Digital inspiration palette. Add verified supplier swatch photos to `image`
// and supplier colour names/codes here when the physical catalog is supplied.
export type FabricColor = { name: string; hex: string; image?: string };
export type FabricGroup = { name: string; slug: string; texture: string; note: string; colors: FabricColor[] };
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
