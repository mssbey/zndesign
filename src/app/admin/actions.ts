"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  updateProduct,
} from "@/lib/db";
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

async function collectGalleryExtras(formData: FormData): Promise<string[]> {
  const files = formData
    .getAll("gallery")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return parseList(formData.get("existingGalleryExtra"));
  }
  const uploaded: string[] = [];
  for (const file of files) {
    uploaded.push(await saveUploadedImage(file));
  }
  return uploaded;
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
  if (!category) return { error: "Kategori seçin." };
  if (!collection) return { error: "Koleksiyon seçin." };
  if (!(coverFile instanceof File) || coverFile.size === 0) {
    return { error: "Kapak görseli zorunludur." };
  }
  if (getProductBySlug(slug)) {
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
    galleryExtra = await collectGalleryExtras(formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Galeri görseli yüklenemedi." };
  }

  createProduct({
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

  const existing = getProductBySlug(originalSlug);
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
  if (!category) return { error: "Kategori seçin." };
  if (!collection) return { error: "Koleksiyon seçin." };
  if (slug !== originalSlug && getProductBySlug(slug)) {
    return { error: "Bu URL (slug) zaten kullanılıyor. Başka bir tane deneyin." };
  }

  let image = existing.image;
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      image = await saveUploadedImage(coverFile);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Görsel yüklenemedi." };
    }
  }

  let galleryExtra: string[];
  try {
    galleryExtra = await collectGalleryExtras(formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Galeri görseli yüklenemedi." };
  }

  updateProduct(originalSlug, {
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
  deleteProduct(slug);
  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath("/admin");
  redirect("/admin");
}
