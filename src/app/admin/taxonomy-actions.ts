"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { deleteTaxonomy, getCategories, getCollections, moveTaxonomy, saveTaxonomy, taxonomyExists, type TaxonomyKind } from "@/lib/taxonomy";
import { saveUploadedImage } from "@/lib/upload";
import { slugify } from "@/lib/slug";

export type TaxonomyState = { error?: string; success?: string; revision?: string };
const fallbackImage = { category: "/images/bedding.webp", collection: "/images/hero.webp" };
const label = { category: "Kategori", collection: "Koleksiyon" };

async function requireAdmin() {
  if (!isValidSessionToken((await cookies()).get(SESSION_COOKIE_NAME)?.value)) redirect("/admin/login");
}
function isKind(kind: string): kind is TaxonomyKind {
  return kind === "category" || kind === "collection";
}
function refresh() {
  // Categories and collections appear in the site header, footer and most pages.
  revalidatePath("/", "layout");
}

export async function saveTaxonomyAction(kind: TaxonomyKind, originalSlug: string | null, _state: TaxonomyState, data: FormData): Promise<TaxonomyState> {
  await requireAdmin();
  if (!isKind(kind)) return { error: "Geçersiz istek." };
  const name = String(data.get("name") || "").trim();
  const slug = slugify(String(data.get("slug") || "") || name);
  const description = String(data.get("description") || "").trim();
  const subtitle = String(data.get("subtitle") || "").trim();
  if (!name || name.length > 80) return { error: "1–80 karakter uzunluğunda bir ad yazın." };
  if (!slug) return { error: "Geçerli bir URL (slug) girin." };
  if (description.length > 400) return { error: "Açıklama en fazla 400 karakter olabilir." };
  if (subtitle.length > 120) return { error: "Alt başlık en fazla 120 karakter olabilir." };
  const list = kind === "category" ? await getCategories() : await getCollections();
  const existing = originalSlug ? list.find((item) => item.slug === originalSlug) : undefined;
  if (originalSlug && !existing) return { error: `${label[kind]} bulunamadı. Sayfayı yenileyin.` };
  if (slug !== originalSlug && (await taxonomyExists(kind, slug))) {
    return { error: "Bu URL (slug) zaten kullanılıyor. Başka bir tane deneyin." };
  }
  let image = existing?.image || fallbackImage[kind];
  const file = data.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      image = await saveUploadedImage(file);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Görsel yüklenemedi." };
    }
  }
  try {
    await saveTaxonomy(kind, originalSlug, { slug, name, description, image, subtitle });
  } catch {
    return { error: `${label[kind]} kaydedilemedi. Lütfen tekrar deneyin.` };
  }
  refresh();
  return { success: originalSlug ? `${label[kind]} güncellendi.` : `${label[kind]} eklendi.`, revision: randomUUID() };
}

export async function deleteTaxonomyAction(kind: TaxonomyKind, slug: string): Promise<TaxonomyState> {
  await requireAdmin();
  if (!isKind(kind)) return { error: "Geçersiz istek." };
  let blocking: number;
  try {
    blocking = await deleteTaxonomy(kind, slug);
  } catch {
    return { error: `${label[kind]} silinemedi. Lütfen tekrar deneyin.` };
  }
  if (blocking > 0) {
    const target = kind === "category" ? "kategoriye" : "koleksiyona";
    return { error: `Bu ${label[kind].toLocaleLowerCase("tr")} ${blocking} üründe kullanılıyor. Önce bu ürünleri başka bir ${target} taşıyın.` };
  }
  refresh();
  return { success: `${label[kind]} silindi.` };
}

export async function moveTaxonomyAction(kind: TaxonomyKind, slug: string, direction: -1 | 1) {
  await requireAdmin();
  if (!isKind(kind) || (direction !== -1 && direction !== 1)) return;
  await moveTaxonomy(kind, slug, direction);
  refresh();
}
