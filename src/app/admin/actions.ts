"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  reorderProducts,
  updateProduct,
} from "@/lib/db";
import { taxonomyExists } from "@/lib/taxonomy";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  isValidPassword,
  isValidSessionToken,
} from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";
import { slugify } from "@/lib/slug";

export type FormState = { error?: string };

async function requireAdmin() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) redirect("/admin/login");
}

export async function loginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") || "");
  if (!isValidPassword(password)) {
    return { error: "Şifre hatalı." };
  }
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}

function parseList(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Kept images in the order chosen in the form (only the product's own images are accepted), then new uploads. */
async function collectGalleryExtras(formData: FormData, owned: string[], cover: string): Promise<string[]> {
  let kept: string[] = [];
  try {
    const parsed: unknown = JSON.parse(String(formData.get("existingGalleryExtra") || "[]"));
    if (Array.isArray(parsed)) kept = parsed.filter((src): src is string => typeof src === "string" && owned.includes(src));
  } catch {}
  const files = formData
    .getAll("gallery")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded: string[] = [];
  for (const file of files) {
    uploaded.push(await saveUploadedImage(file));
  }
  return [...new Set([...kept, ...uploaded])].filter((src) => src !== cover);
}

async function validateTaxonomy(category: string, collection: string): Promise<string | undefined> {
  if (!category) return "Kategori seçin.";
  if (!collection) return "Koleksiyon seçin.";
  if (!(await taxonomyExists("category", category))) return "Seçilen kategori artık yok. Sayfayı yenileyin.";
  if (!(await taxonomyExists("collection", collection))) return "Seçilen koleksiyon artık yok. Sayfayı yenileyin.";
}

export async function createProductAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "");
  const collection = String(formData.get("collection") || "");
  const rawSlug = String(formData.get("slug") || "");
  const slug = slugify(rawSlug || name);
  const coverFile = formData.get("image");

  if (!name) return { error: "Ürün adı zorunludur." };
  if (!slug) return { error: "Geçerli bir URL (slug) girin." };
  const taxonomyError = await validateTaxonomy(category, collection);
  if (taxonomyError) return { error: taxonomyError };
  if (!(coverFile instanceof File) || coverFile.size === 0) {
    return { error: "Kapak görseli zorunludur." };
  }
  if (await getProductBySlug(slug)) {
    return { error: "Bu URL (slug) zaten kullanılıyor. Başka bir tane deneyin." };
  }

  let image: string;
  try {
    image = await saveUploadedImage(coverFile);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Görsel yüklenemedi." };
  }

  let galleryExtra: string[];
  try {
    galleryExtra = await collectGalleryExtras(formData, [], image);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Galeri görseli yüklenemedi." };
  }

  await createProduct({
    slug,
    name,
    category,
    collection,
    image,
    gallery: [image, ...galleryExtra],
    sizes: parseList(formData.get("sizes")),
    colors: parseList(formData.get("colors")),
    fabrics: parseList(formData.get("fabrics")),
    isNew: formData.get("isNew") === "on",
    campaign: formData.get("campaign") === "on",
    description,
  });

  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProductAction(
  originalSlug: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const existing = await getProductBySlug(originalSlug);
  if (!existing) return { error: "Ürün bulunamadı." };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "");
  const collection = String(formData.get("collection") || "");
  const rawSlug = String(formData.get("slug") || "");
  const slug = slugify(rawSlug || name);
  const coverFile = formData.get("image");

  if (!name) return { error: "Ürün adı zorunludur." };
  if (!slug) return { error: "Geçerli bir URL (slug) girin." };
  if (category !== existing.category || collection !== existing.collection) {
    const taxonomyError = await validateTaxonomy(category, collection);
    if (taxonomyError) return { error: taxonomyError };
  }
  if (slug !== originalSlug && (await getProductBySlug(slug))) {
    return { error: "Bu URL (slug) zaten kullanılıyor. Başka bir tane deneyin." };
  }

  const owned = [existing.image, ...existing.gallery];
  const chosenCover = String(formData.get("existingCover") || "");
  let image = owned.includes(chosenCover) ? chosenCover : existing.image;
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      image = await saveUploadedImage(coverFile);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Görsel yüklenemedi." };
    }
  }

  let galleryExtra: string[];
  try {
    galleryExtra = await collectGalleryExtras(formData, owned, image);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Galeri görseli yüklenemedi." };
  }

  await updateProduct(originalSlug, {
    slug,
    name,
    category,
    collection,
    image,
    gallery: [image, ...galleryExtra],
    sizes: parseList(formData.get("sizes")),
    colors: parseList(formData.get("colors")),
    fabrics: parseList(formData.get("fabrics")),
    isNew: formData.get("isNew") === "on",
    campaign: formData.get("campaign") === "on",
    description,
  });

  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath(`/urunler/${originalSlug}`);
  if (slug !== originalSlug) revalidatePath(`/urunler/${slug}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProductAction(slug: string) {
  await requireAdmin();
  await deleteProduct(slug);
  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function reorderProductsAction(slugs: string[]): Promise<FormState> {
  await requireAdmin();
  if (!(await reorderProducts(slugs))) {
    return { error: "Ürün listesi değişmiş. Sayfayı yenileyip tekrar deneyin." };
  }
  revalidatePath("/", "layout");
  return {};
}
