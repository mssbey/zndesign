import { neon } from "@neondatabase/serverless";
import { defaultSlides, type Slide } from "./content-sections";
import { getStoredValues, mergeSection, setStoredValue } from "./content";

export { defaultSlides, type Slide };
const ORDER_KEY = "slide-order";
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
/** Display order as slide indexes; falls back to the default order unless the stored value is a full permutation. */
export async function getSlideOrder(): Promise<number[]> {
  const stored = (await getStoredValues([ORDER_KEY]))[ORDER_KEY];
  const order = defaultSlides.map((_, i) => i);
  const valid = Array.isArray(stored) && stored.length === order.length && order.every(i => stored.includes(i));
  return valid ? stored as number[] : order;
}
/** Slides in the order chosen in the admin panel. */
export async function getOrderedSlides(): Promise<Slide[]> {
  const [slides, order] = await Promise.all([getSlides(), getSlideOrder()]);
  return order.map(i => slides[i]);
}
export async function moveSlide(index: number, direction: -1 | 1) {
  const order = await getSlideOrder();
  const from = order.indexOf(index), to = from + direction;
  if (from < 0 || to < 0 || to >= order.length) return;
  [order[from], order[to]] = [order[to], order[from]];
  await setStoredValue(ORDER_KEY, order);
}
