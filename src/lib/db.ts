import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type Product = {
  slug: string;
  name: string;
  category: string;
  collection: string;
  image: string;
  gallery: string[];
  sizes: string[];
  colors: string[];
  fabrics: string[];
  isNew: boolean;
  campaign: boolean;
  added: string;
  description: string;
};

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  collection: string;
  image: string;
  gallery: string;
  sizes: string;
  colors: string;
  fabrics: string;
  is_new: number;
  campaign: number;
  added: string;
  description: string;
};

const dataDir = path.join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

const globalForDb = globalThis as unknown as { __znDb?: DatabaseSync };

const db =
  globalForDb.__znDb ??
  new DatabaseSync(path.join(dataDir, "app.db"), { timeout: 5000 });
globalForDb.__znDb = db;

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA busy_timeout = 5000;");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    collection TEXT NOT NULL,
    image TEXT NOT NULL,
    gallery TEXT NOT NULL,
    sizes TEXT NOT NULL,
    colors TEXT NOT NULL,
    fabrics TEXT NOT NULL,
    is_new INTEGER NOT NULL DEFAULT 0,
    campaign INTEGER NOT NULL DEFAULT 0,
    added TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''
  );
`);

function seedIfEmpty() {
  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM products")
    .get() as { count: number };
  if (count > 0) return;

  const names = [
    "Luna",
    "Siena",
    "Como",
    "Nova",
    "Arden",
    "Linea",
    "Mira",
    "Vera",
    "Duru",
    "Natura",
    "Aura",
    "Linen",
    "Mini Luna",
    "Milo",
    "Nora",
    "Elisa",
  ];
  const groups = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 0, 3];
  const categorySlugs = [
    "baza-baslik-setleri",
    "bazalar",
    "yatak-basliklari",
    "yataklar",
    "uyku-setleri",
    "kids",
  ];
  const categoryImages = [
    "/images/hero.webp",
    "/images/base.webp",
    "/images/headboard.webp",
    "/images/mattress.webp",
    "/images/bedding.webp",
    "/images/kids.webp",
  ];
  const categoryDescriptions = [
    "Birbirini tamamlayan çizgiler, yatak odanızda dengeli bir bütün.",
    "Yaşam alanınız için sade ve kullanışlı alternatifler.",
    "Mekânın karakterini belirleyen dokular ve detaylar.",
    "Uyku alanınız için farklı ölçülerde seçenekler.",
    "Yatak odanızın atmosferini tamamlayan yumuşak dokular.",
    "Küçük dünyalar için sakin renkler ve sıcak detaylar.",
  ];

  const insert = db.prepare(`
    INSERT INTO products
      (slug, name, category, collection, image, gallery, sizes, colors, fabrics, is_new, campaign, added, description)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  names.forEach((name, i) => {
    const g = groups[i];
    const image =
      g === 0
        ? i % 2
          ? "/images/modern.webp"
          : "/images/hero.webp"
        : categoryImages[g];
    const gallery =
      image === "/images/hero.webp" ? [image, "/images/luna-detail.webp"] : [image];
    const sizes =
      g === 5 ? ["90 × 190 cm", "100 × 200 cm"] : ["140 × 200 cm", "160 × 200 cm", "180 × 200 cm"];
    const colors = g === 3 ? ["Krem"] : ["Krem", "Bej", i % 2 ? "Antrasit" : "Taş"];
    const fabrics =
      g === 3 ? ["Dokuma"] : i % 2 ? ["Keten dokulu", "Kadife"] : ["Keten dokulu", "Bukle"];
    const slug = name.toLowerCase().replaceAll(" ", "-");
    insert.run(
      slug,
      name,
      categorySlugs[g],
      g === 5 ? "kids-dunyasi" : i % 2 ? "modern-konfor" : "sade-yasam",
      image,
      JSON.stringify(gallery),
      JSON.stringify(sizes),
      JSON.stringify(colors),
      JSON.stringify(fabrics),
      i < 4 || i === 12 ? 1 : 0,
      0,
      `2026-08-${String(28 - i).padStart(2, "0")}`,
      `${name}: ${categoryDescriptions[g]} Renk, kumaş ve ölçü alternatiflerini birlikte değerlendirelim.`,
    );
  });
}
seedIfEmpty();

function fromRow(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    collection: row.collection,
    image: row.image,
    gallery: JSON.parse(row.gallery),
    sizes: JSON.parse(row.sizes),
    colors: JSON.parse(row.colors),
    fabrics: JSON.parse(row.fabrics),
    isNew: !!row.is_new,
    campaign: !!row.campaign,
    added: row.added,
    description: row.description,
  };
}

export function getProducts(): Product[] {
  const rows = db
    .prepare("SELECT * FROM products ORDER BY added DESC")
    .all() as unknown as ProductRow[];
  return rows.map(fromRow);
}

export function getProductBySlug(slug: string): Product | null {
  const row = db
    .prepare("SELECT * FROM products WHERE slug = ?")
    .get(slug) as unknown as ProductRow | undefined;
  return row ? fromRow(row) : null;
}

export type ProductInput = Omit<Product, "added"> & { added?: string };

export function createProduct(input: ProductInput) {
  db.prepare(
    `INSERT INTO products
      (slug, name, category, collection, image, gallery, sizes, colors, fabrics, is_new, campaign, added, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    input.slug,
    input.name,
    input.category,
    input.collection,
    input.image,
    JSON.stringify(input.gallery),
    JSON.stringify(input.sizes),
    JSON.stringify(input.colors),
    JSON.stringify(input.fabrics),
    input.isNew ? 1 : 0,
    input.campaign ? 1 : 0,
    input.added || new Date().toISOString().slice(0, 10),
    input.description,
  );
}

export function updateProduct(originalSlug: string, input: ProductInput) {
  db.prepare(
    `UPDATE products SET
      slug = ?, name = ?, category = ?, collection = ?, image = ?, gallery = ?,
      sizes = ?, colors = ?, fabrics = ?, is_new = ?, campaign = ?, description = ?
     WHERE slug = ?`,
  ).run(
    input.slug,
    input.name,
    input.category,
    input.collection,
    input.image,
    JSON.stringify(input.gallery),
    JSON.stringify(input.sizes),
    JSON.stringify(input.colors),
    JSON.stringify(input.fabrics),
    input.isNew ? 1 : 0,
    input.campaign ? 1 : 0,
    input.description,
    originalSlug,
  );
}

export function deleteProduct(slug: string) {
  db.prepare("DELETE FROM products WHERE slug = ?").run(slug);
}
