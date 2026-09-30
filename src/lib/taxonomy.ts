import { cache } from "react";
import { neon } from "@neondatabase/serverless";
import {
  categoryAliases,
  collectionAliases,
  defaultCategories,
  defaultCollections,
  type Category,
  type Collection,
} from "./data";
import { ensureInit as ensureProducts } from "./db";

export type TaxonomyKind = "category" | "collection";
// Table and column names are fixed here, never taken from user input.
const tables = {
  category: { table: "categories", productColumn: "category", aliases: categoryAliases },
  collection: { table: "collections", productColumn: "collection", aliases: collectionAliases },
} as const;

const sql = neon(process.env.DATABASE_URL!);
let init: Promise<unknown> | undefined;

async function ready() {
  init ??= (async () => {
    const [existing] = (await sql.query(
      "SELECT to_regclass('public.categories') IS NOT NULL AS categories, to_regclass('public.collections') IS NOT NULL AS collections",
    )) as { categories: boolean; collections: boolean }[];
    await sql.query(`CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS collections (
      slug TEXT PRIMARY KEY, name TEXT NOT NULL, subtitle TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0
    )`);
    // Seed only when the table is first created, so deleting every row in the admin stays deleted.
    if (!existing.categories) {
      for (const [i, c] of defaultCategories.entries()) {
        await sql.query(
          "INSERT INTO categories (slug, name, description, image, position) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING",
          [c.slug, c.name, c.description, c.image, i],
        );
      }
    }
    if (!existing.collections) {
      for (const [i, c] of defaultCollections.entries()) {
        await sql.query(
          "INSERT INTO collections (slug, name, subtitle, description, image, position) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING",
          [c.slug, c.name, c.subtitle, c.description, c.image, i],
        );
      }
    }
  })().catch((error) => {
    init = undefined;
    throw error;
  });
  await init;
}

export const getCategories = cache(async (): Promise<Category[]> => {
  await ready();
  return (await sql.query(
    "SELECT slug, name, description, image FROM categories ORDER BY position, name",
  )) as Category[];
});

export const getCollections = cache(async (): Promise<Collection[]> => {
  await ready();
  return (await sql.query(
    "SELECT slug, name, subtitle, description, image FROM collections ORDER BY position, name",
  )) as Collection[];
});

/** Stored slugs that resolve to `slug`, including legacy aliases still present on old product rows. */
function storedSlugs(kind: TaxonomyKind, slug: string) {
  const aliases: Record<string, string> = tables[kind].aliases;
  return [slug, ...Object.keys(aliases).filter((legacy) => aliases[legacy] === slug)];
}

/** Product counts keyed by (alias-resolved) category or collection slug. */
export async function countProducts(kind: TaxonomyKind): Promise<Record<string, number>> {
  await ensureProducts();
  const { productColumn, aliases } = tables[kind];
  const rows = (await sql.query(
    `SELECT ${productColumn} AS slug, COUNT(*)::int AS count FROM products GROUP BY ${productColumn}`,
  )) as { slug: string; count: number }[];
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const slug = (aliases as Record<string, string>)[row.slug] || row.slug;
    counts[slug] = (counts[slug] || 0) + row.count;
  }
  return counts;
}

export async function taxonomyExists(kind: TaxonomyKind, slug: string) {
  await ready();
  const rows = await sql.query(`SELECT 1 FROM ${tables[kind].table} WHERE slug = $1`, [slug]);
  return rows.length > 0;
}

/** Inserts (originalSlug null) or updates an entry; a changed slug is carried over to its products. */
export async function saveTaxonomy(kind: TaxonomyKind, originalSlug: string | null, item: Collection) {
  await ready();
  await ensureProducts();
  const { table, productColumn } = tables[kind];
  const subtitle = kind === "collection" ? item.subtitle : "";
  if (!originalSlug) {
    const columns = kind === "collection" ? "slug, name, description, image, subtitle" : "slug, name, description, image";
    const values = kind === "collection" ? "$1,$2,$3,$4,$5" : "$1,$2,$3,$4";
    const params = [item.slug, item.name, item.description, item.image, ...(kind === "collection" ? [subtitle] : [])];
    await sql.query(
      `INSERT INTO ${table} (${columns}, position)
       VALUES (${values}, (SELECT COALESCE(MAX(position), -1) + 1 FROM ${table}))`,
      params,
    );
    return;
  }
  const set = kind === "collection"
    ? "slug = $1, name = $2, description = $3, image = $4, subtitle = $6"
    : "slug = $1, name = $2, description = $3, image = $4";
  const params = [item.slug, item.name, item.description, item.image, originalSlug, ...(kind === "collection" ? [subtitle] : [])];
  await sql.transaction([
    sql.query(`UPDATE ${table} SET ${set} WHERE slug = $5`, params),
    ...(item.slug !== originalSlug
      ? [sql.query(`UPDATE products SET ${productColumn} = $1 WHERE ${productColumn} = ANY($2::text[])`, [
          item.slug,
          storedSlugs(kind, originalSlug),
        ])]
      : []),
  ]);
}

/** Deletes an entry that no product uses; returns the number of blocking products otherwise. */
export async function deleteTaxonomy(kind: TaxonomyKind, slug: string): Promise<number> {
  await ready();
  const blocking = (await countProducts(kind))[slug] || 0;
  if (blocking > 0) return blocking;
  await sql.query(`DELETE FROM ${tables[kind].table} WHERE slug = $1`, [slug]);
  return 0;
}

/** Swaps an entry with its neighbour in display order. */
export async function moveTaxonomy(kind: TaxonomyKind, slug: string, direction: -1 | 1) {
  await ready();
  const { table } = tables[kind];
  const slugs = ((await sql.query(`SELECT slug FROM ${table} ORDER BY position, name`)) as { slug: string }[]).map((r) => r.slug);
  const from = slugs.indexOf(slug);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= slugs.length) return;
  [slugs[from], slugs[to]] = [slugs[to], slugs[from]];
  await sql.query(
    `UPDATE ${table} SET position = o.pos - 1
     FROM unnest($1::text[]) WITH ORDINALITY AS o(slug, pos)
     WHERE ${table}.slug = o.slug`,
    [slugs],
  );
}
