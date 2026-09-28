"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { getGallery, saveGalleryItem, removeGalleryItem } from "@/lib/gallery";
import { saveUploadedImage } from "@/lib/upload";
import { matchesImageSignature } from "@/lib/reference-images";

export type GalleryState = { error?: string; success?: string; revision?: string };
async function requireAdmin() {
  if (!isValidSessionToken((await cookies()).get(SESSION_COOKIE_NAME)?.value)) redirect("/admin/login");
}
function refresh() {
  for (const path of ["/admin/gallery", "/biz-kimiz", "/fabrikamiz", "/"]) revalidatePath(path);
}
export async function saveGalleryAction(id: string | null, _state: GalleryState, data: FormData): Promise<GalleryState> {
  await requireAdmin();
  const caption = String(data.get("caption") || "").trim();
  const category = String(data.get("category") || "");
  const position = Number(data.get("position") || 0);
  if (!caption || caption.length > 180) return { error: "1–180 karakter uzunluğunda bir açıklama yazın." };
  if (category !== "factory" && category !== "delivery") return { error: "Bir galeri kategorisi seçin." };
  if (!Number.isInteger(position) || position < 0 || position > 9999) return { error: "Sıra 0–9999 arasında bir tam sayı olmalıdır." };
  let uploaded: string | undefined;
  try {
    const existing = id ? (await getGallery()).find(item => item.id === id) : undefined;
    if (id && !existing) return { error: "Görsel bulunamadı. Sayfayı yenileyin." };
    const file = data.get("image");
    if (file instanceof File && file.size > 0) {
      if (file.size > 3 * 1024 * 1024) return { error: "Görsel en fazla 3 MB olabilir." };
      if (!matchesImageSignature(new Uint8Array(await file.slice(0, 12).arrayBuffer()), file.type)) return { error: "Geçerli bir JPG, PNG veya WEBP görseli seçin." };
      uploaded = await saveUploadedImage(file);
    }
    const src = uploaded || existing?.src;
    if (!src) return { error: "Bir fotoğraf seçin." };
    await saveGalleryItem({ id: id || randomUUID(), category, src, caption, position });
  } catch {
    if (uploaded) await del(uploaded).catch(() => {});
    return { error: "Görsel kaydedilemedi. Lütfen tekrar deneyin." };
  }
  refresh();
  return { success: id ? "Görsel güncellendi." : "Görsel galeriye eklendi.", revision: randomUUID() };
}
export async function deleteGalleryAction(id: string): Promise<GalleryState> {
  await requireAdmin();
  try { await removeGalleryItem(id); }
  catch { return { error: "Görsel kaldırılamadı. Lütfen tekrar deneyin." }; }
  // Keep the original file: removing a gallery entry must not break a shared image URL.
  refresh();
  return { success: "Görsel galeriden kaldırıldı." };
}
