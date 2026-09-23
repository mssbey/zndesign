import { neon } from "@neondatabase/serverless";
import { categoryAliases, collectionAliases } from "./data";

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
  is_new: boolean;
  campaign: boolean;
  added: string;
  description: string;
};

const sql = neon(process.env.DATABASE_URL!);

let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await sql.query(`
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
          is_new BOOLEAN NOT NULL DEFAULT false,
          campaign BOOLEAN NOT NULL DEFAULT false,
          added TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT ''
        );
      `);
      await seedIfEmpty();
    })();
  }
  return initPromise;
}

async function seedIfEmpty() {
  const rows = await sql.query("SELECT COUNT(*)::int as count FROM products");
  const count = (rows[0] as { count: number }).count;
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

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
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

    await sql.query(
      `INSERT INTO products
        (slug, name, category, collection, image, gallery, sizes, colors, fabrics, is_new, campaign, added, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (slug) DO NOTHING`,
      [
        slug,
        name,
        categorySlugs[g],
        g === 5 ? "kids-dunyasi" : i % 2 ? "modern-konfor" : "sade-yasam",
        image,
        JSON.stringify(gallery),
        JSON.stringify(sizes),
        JSON.stringify(colors),
        JSON.stringify(fabrics),
        i < 4 || i === 12,
        false,
        `2026-08-${String(28 - i).padStart(2, "0")}`,
        `${name}: ${categoryDescriptions[g]} Renk, kumaş ve ölçü alternatiflerini birlikte değerlendirelim.`,
      ],
    );
  }
}

function fromRow(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name.replace(/zn\s+design/gi, "Zenn Bedding"),
    category: categoryAliases[row.category] || row.category,
    collection: collectionAliases[row.collection] || row.collection,
    image: row.image,
    gallery: JSON.parse(row.gallery),
    sizes: JSON.parse(row.sizes),
    colors: JSON.parse(row.colors),
    fabrics: JSON.parse(row.fabrics),
    isNew: row.is_new,
    campaign: row.campaign,
    added: row.added,
    description: row.description.replace(/zn\s+design/gi, "Zenn Bedding"),
  };
}

export async function getProducts(): Promise<Product[]> {
  await ensureInit();
  const rows = (await sql.query(
    "SELECT * FROM products ORDER BY added DESC",
  )) as unknown as ProductRow[];
  return rows.map(fromRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await ensureInit();
  const rows = (await sql.query(
    "SELECT * FROM products WHERE slug = $1",
    [slug],
  )) as unknown as ProductRow[];
  return rows[0] ? fromRow(rows[0]) : null;
}

export type ProductInput = Omit<Product, "added"> & { added?: string };

export async function createProduct(input: ProductInput) {
  await ensureInit();
  await sql.query(
    `INSERT INTO products
      (slug, name, category, collection, image, gallery, sizes, colors, fabrics, is_new, campaign, added, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      input.slug,
      input.name,
      input.category,
      input.collection,
      input.image,
      JSON.stringify(input.gallery),
      JSON.stringify(input.sizes),
      JSON.stringify(input.colors),
      JSON.stringify(input.fabrics),
      input.isNew,
      input.campaign,
      input.added || new Date().toISOString().slice(0, 10),
      input.description,
    ],
  );
}

export async function updateProduct(originalSlug: string, input: ProductInput) {
  await ensureInit();
  await sql.query(
    `UPDATE products SET
      slug = $1, name = $2, category = $3, collection = $4, image = $5, gallery = $6,
      sizes = $7, colors = $8, fabrics = $9, is_new = $10, campaign = $11, description = $12
     WHERE slug = $13`,
    [
      input.slug,
      input.name,
      input.category,
      input.collection,
      input.image,
      JSON.stringify(input.gallery),
      JSON.stringify(input.sizes),
      JSON.stringify(input.colors),
      JSON.stringify(input.fabrics),
      input.isNew,
      input.campaign,
      input.description,
      originalSlug,
    ],
  );
}

export async function deleteProduct(slug: string) {
  await ensureInit();
  await sql.query("DELETE FROM products WHERE slug = $1", [slug]);
}
