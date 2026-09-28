import { neon } from "@neondatabase/serverless";

export type GalleryItem = { id: string; category: "factory" | "delivery"; src: string; caption: string; position: number };
const sql = neon(process.env.DATABASE_URL!);
let init: Promise<unknown> | undefined;
async function ready() {
  init ??= sql.query(`CREATE TABLE IF NOT EXISTS company_gallery (
    id TEXT PRIMARY KEY, category TEXT NOT NULL CHECK (category IN ('factory', 'delivery')),
    src TEXT NOT NULL, caption TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`).catch(error => { init = undefined; throw error; });
  await init;
}
export async function getGallery(): Promise<GalleryItem[]> {
  await ready();
  return await sql.query("SELECT id, category, src, caption, position FROM company_gallery ORDER BY position, created_at DESC, id") as GalleryItem[];
}
export async function saveGalleryItem(item: GalleryItem) {
  await ready();
  await sql.query(`INSERT INTO company_gallery (id, category, src, caption, position) VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, src = EXCLUDED.src, caption = EXCLUDED.caption, position = EXCLUDED.position`,
    [item.id, item.category, item.src, item.caption, item.position]);
}
export async function removeGalleryItem(id: string) {
  await ready();
  await sql.query("DELETE FROM company_gallery WHERE id = $1", [id]);
}
