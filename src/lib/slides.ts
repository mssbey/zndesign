import { neon } from "@neondatabase/serverless";
import { defaultSlides, type Slide } from "./content-sections";
import { getStoredValues, mergeSection } from "./content";

export { defaultSlides, type Slide };
const sql = neon(process.env.DATABASE_URL!);
let init: Promise<unknown> | undefined;
// Images uploaded before slide text became editable; new saves go to site_content.
async function ready() {
  init ??= sql.query("CREATE TABLE IF NOT EXISTS home_slides (id INTEGER PRIMARY KEY, image TEXT NOT NULL)")
    .catch(error => { init = undefined; throw error; });
  await init;
}
/** Default slides with legacy uploaded images and admin overrides applied. */
export async function getSlides(): Promise<Slide[]> {
  await ready();
  const ids = defaultSlides.map((_, i) => `slide-${i}`);
  const [rows, stored] = await Promise.all([
    sql.query("SELECT id, image FROM home_slides") as unknown as Promise<{ id: number; image: string }[]>,
    getStoredValues(ids),
  ]);
  const legacy = new Map(rows.map(row => [row.id, row.image]));
  return defaultSlides.map((slide, i) => {
    const values = mergeSection(ids[i], stored[ids[i]]);
    const hasImage = typeof (stored[ids[i]] as Record<string, unknown> | undefined)?.image === "string";
    return { ...values, image: hasImage ? values.image : legacy.get(i) ?? slide.image } as Slide;
  });
}
export async function resetSlideImage(id: number) {
  await ready();
  await sql.query("DELETE FROM home_slides WHERE id = $1", [id]);
}
