"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { contentSections, pagePaths, type ContentPage, type ContentValues } from "@/lib/content-sections";
import { deleteStoredValue, getContents, setStoredValue } from "@/lib/content";
import { getSlides, moveSlide, resetSlideImage } from "@/lib/slides";
import { fabricTextures, FABRICS_KEY, type FabricGroup } from "@/lib/fabrics";
import { saveUploadedImage } from "@/lib/upload";
import { matchesImageSignature } from "@/lib/reference-images";
import { slugify } from "@/lib/slug";

export type ContentState = { error?: string; success?: string; revision?: string };
export type FabricState = ContentState;

const MAX_IMAGE = 5 * 1024 * 1024;
async function requireAdmin() {
  if (!isValidSessionToken((await cookies()).get(SESSION_COOKIE_NAME)?.value)) redirect("/admin/login");
}
function refresh(page: ContentPage) {
  // The top announcement bar is part of the shared site layout.
  if (page === "home") revalidatePath("/", "layout");
  for (const path of pagePaths[page]) revalidatePath(path);
}
const validHref = (href: string) => /^(\/|#|https?:\/\/|tel:|mailto:)/.test(href);

/** Returns an error message, or null when the file is empty or a valid image. */
async function checkImage(file: FormDataEntryValue | null): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_IMAGE) return "Görsel en fazla 5 MB olabilir.";
  if (!matchesImageSignature(new Uint8Array(await file.slice(0, 12).arrayBuffer()), file.type)) return "Geçerli bir JPG, PNG veya WEBP görseli seçin.";
  return null;
}
const hasFile = (file: FormDataEntryValue | null): file is File => file instanceof File && file.size > 0;

async function currentValues(id: string): Promise<ContentValues> {
  const slide = /^slide-(\d+)$/.exec(id);
  if (slide) return (await getSlides())[Number(slide[1])];
  return (await getContents([id]))[id];
}

export async function saveContentAction(id: string, _state: ContentState, data: FormData): Promise<ContentState> {
  await requireAdmin();
  const section = contentSections[id];
  if (!section) return { error: "Bölüm bulunamadı. Sayfayı yenileyin." };
  const values: ContentValues = {};
  const uploads: [string, File][] = [];
  for (const field of section.fields) {
    if (field.type === "image") {
      const file = data.get(field.key);
      const problem = await checkImage(file);
      if (problem) return { error: `${field.label}: ${problem}` };
      if (hasFile(file)) uploads.push([field.key, file]);
      continue;
    }
    const value = String(data.get(field.key) ?? "").replace(/\r\n/g, "\n").trim();
    if (value.length > (field.type === "textarea" ? 3000 : 300)) return { error: `${field.label} çok uzun.` };
    if (field.type === "link" && value && !validHref(value)) return { error: `${field.label}: adres / veya https:// ile başlamalıdır.` };
    values[field.key] = value;
  }
  const uploaded: string[] = [];
  try {
    const current = await currentValues(id);
    for (const field of section.fields) if (field.type === "image") values[field.key] = current[field.key];
    for (const [key, file] of uploads) {
      const url = await saveUploadedImage(file);
      uploaded.push(url);
      values[key] = url;
    }
    // Store only what differs from the defaults so later default changes still apply.
    const overrides = Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== section.defaults[key]));
    if (Object.keys(overrides).length) await setStoredValue(id, overrides);
    else await deleteStoredValue(id);
  } catch {
    await Promise.all(uploaded.map(url => del(url).catch(() => {})));
    return { error: "Değişiklikler kaydedilemedi. Lütfen tekrar deneyin." };
  }
  refresh(section.page);
  return { success: "Değişiklikler kaydedildi.", revision: randomUUID() };
}

export async function resetContentAction(id: string): Promise<ContentState> {
  await requireAdmin();
  const section = contentSections[id];
  if (!section) return { error: "Bölüm bulunamadı. Sayfayı yenileyin." };
  try {
    await deleteStoredValue(id);
    const slide = /^slide-(\d+)$/.exec(id);
    if (slide) await resetSlideImage(Number(slide[1]));
  } catch { return { error: "Varsayılana dönülemedi. Lütfen tekrar deneyin." }; }
  refresh(section.page);
  return { success: "Varsayılan içeriğe dönüldü.", revision: randomUUID() };
}

export async function moveSlideAction(index: number, direction: -1 | 1) {
  await requireAdmin();
  if (!Number.isInteger(index) || (direction !== -1 && direction !== 1)) return;
  await moveSlide(index, direction);
  refresh("slider");
}

type FabricInput = { name?: unknown; note?: unknown; texture?: unknown; colors?: { uid?: unknown; name?: unknown; hex?: unknown; image?: unknown }[] }[];

export async function saveFabricsAction(_state: FabricState, data: FormData): Promise<FabricState> {
  await requireAdmin();
  let input: FabricInput;
  try { input = JSON.parse(String(data.get("groups") || "[]")); } catch { return { error: "Form verisi okunamadı. Sayfayı yenileyin." }; }
  if (!Array.isArray(input) || !input.length) return { error: "En az bir kumaş grubu olmalıdır." };
  if (input.length > 40) return { error: "En fazla 40 kumaş grubu eklenebilir." };
  const groups: FabricGroup[] = [];
  const files: [number, number, File][] = [];
  const slugs = new Set<string>();
  for (const [gi, group] of input.entries()) {
    const name = String(group.name ?? "").trim();
    const note = String(group.note ?? "").trim();
    const texture = String(group.texture ?? "");
    if (!name || name.length > 60) return { error: `${gi + 1}. grup: 1–60 karakterlik bir kumaş adı yazın.` };
    if (note.length > 300) return { error: `${name}: açıklama en fazla 300 karakter olabilir.` };
    if (!fabricTextures.some(t => t.value === texture)) return { error: `${name}: bir doku görünümü seçin.` };
    let slug = slugify(name) || `kumas-${gi + 1}`;
    while (slugs.has(slug)) slug += "-2";
    slugs.add(slug);
    const colors = Array.isArray(group.colors) ? group.colors : [];
    if (!colors.length || colors.length > 40) return { error: `${name}: 1–40 arasında renk ekleyin.` };
    const parsed: FabricGroup["colors"] = [];
    for (const [ci, color] of colors.entries()) {
      const colorName = String(color.name ?? "").trim();
      const hex = String(color.hex ?? "");
      const image = typeof color.image === "string" && color.image ? color.image : undefined;
      if (!colorName || colorName.length > 60) return { error: `${name}: ${ci + 1}. renk için 1–60 karakterlik bir ad yazın.` };
      if (!/^#[0-9a-f]{6}$/i.test(hex)) return { error: `${name} / ${colorName}: geçerli bir renk seçin.` };
      if (image && !/^(\/|https:\/\/)/.test(image)) return { error: `${name} / ${colorName}: görsel adresi geçersiz.` };
      const file = data.get(`file-${String(color.uid ?? "")}`);
      const problem = await checkImage(file);
      if (problem) return { error: `${name} / ${colorName}: ${problem}` };
      if (hasFile(file)) files.push([groups.length, ci, file]);
      parsed.push({ name: colorName, hex: hex.toLowerCase(), ...(image ? { image } : {}) });
    }
    groups.push({ name, slug, note, texture, colors: parsed });
  }
  const uploaded: string[] = [];
  try {
    for (const [gi, ci, file] of files) {
      const url = await saveUploadedImage(file);
      uploaded.push(url);
      groups[gi].colors[ci].image = url;
    }
    await setStoredValue(FABRICS_KEY, groups);
  } catch {
    await Promise.all(uploaded.map(url => del(url).catch(() => {})));
    return { error: "Kumaşlar kaydedilemedi. Lütfen tekrar deneyin." };
  }
  refresh("fabrics");
  revalidatePath("/ozel-uretim");
  return { success: "Kumaş kartelası kaydedildi.", revision: randomUUID() };
}

export async function resetFabricsAction(): Promise<FabricState> {
  await requireAdmin();
  try { await deleteStoredValue(FABRICS_KEY); }
  catch { return { error: "Varsayılan kartelaya dönülemedi. Lütfen tekrar deneyin." }; }
  refresh("fabrics");
  return { success: "Varsayılan kartelaya dönüldü.", revision: randomUUID() };
}
