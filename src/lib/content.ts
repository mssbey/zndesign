import { neon } from "@neondatabase/serverless";
import { contentSections, type ContentValues } from "./content-sections";
import { FABRICS_KEY, fabricGroups, type FabricGroup } from "./fabrics";

const sql = neon(process.env.DATABASE_URL!);
let init: Promise<unknown> | undefined;
async function ready() {
  init ??= sql.query("CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())")
    .catch(error => { init = undefined; throw error; });
  await init;
}

/** Raw stored JSON values keyed by content key; missing keys are absent. */
export async function getStoredValues(keys: string[]): Promise<Record<string, unknown>> {
  await ready();
  const rows = await sql.query("SELECT key, value FROM site_content WHERE key = ANY($1)", [keys]) as { key: string; value: string }[];
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    try { result[row.key] = JSON.parse(row.value); } catch { /* ignore corrupt rows; defaults apply */ }
  }
  return result;
}
export async function setStoredValue(key: string, value: unknown) {
  await ready();
  await sql.query(
    "INSERT INTO site_content (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
    [key, JSON.stringify(value)],
  );
}
export async function deleteStoredValue(key: string) {
  await ready();
  await sql.query("DELETE FROM site_content WHERE key = $1", [key]);
}

/** Section defaults with the admin's saved overrides (only known string fields) applied. */
export function mergeSection(id: string, stored: unknown): ContentValues {
  const section = contentSections[id];
  const values = { ...section.defaults };
  if (stored && typeof stored === "object") {
    for (const field of section.fields) {
      const value = (stored as Record<string, unknown>)[field.key];
      if (typeof value === "string") values[field.key] = value;
    }
  }
  return values;
}

/** Content for several sections; falls back to defaults if the database is unavailable. */
export async function getContents(ids: string[]): Promise<Record<string, ContentValues>> {
  const stored = await getStoredValues(ids).catch(error => { console.error("site_content okunamadı", error); return {} as Record<string, unknown>; });
  return Object.fromEntries(ids.map(id => [id, mergeSection(id, stored[id])]));
}

/** Saved fabric catalog, or the built-in default palette. */
export async function getFabricGroups(): Promise<FabricGroup[]> {
  const stored = await getStoredValues([FABRICS_KEY]).catch(error => { console.error("Kumaş kartelası okunamadı", error); return {} as Record<string, unknown>; });
  const groups = stored[FABRICS_KEY];
  return Array.isArray(groups) && groups.length ? groups as FabricGroup[] : fabricGroups;
}
