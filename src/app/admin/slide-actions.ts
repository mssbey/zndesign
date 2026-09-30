"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { defaultSlides, setSlideImage, resetSlideImage } from "@/lib/slides";
import { saveUploadedImage } from "@/lib/upload";
import { matchesImageSignature } from "@/lib/reference-images";

export type SlideState = { error?: string; success?: string; revision?: string };
async function requireAdmin() {
  if (!isValidSessionToken((await cookies()).get(SESSION_COOKIE_NAME)?.value)) redirect("/admin/login");
}
function refresh() {
  for (const path of ["/admin/slider", "/"]) revalidatePath(path);
}
export async function saveSlideAction(id: number, _state: SlideState, data: FormData): Promise<SlideState> {
  await requireAdmin();
  if (!defaultSlides[id]) return { error: "Slayt bulunamadı. Sayfayı yenileyin." };
  const file = data.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Bir görsel seçin." };
  if (file.size > 3 * 1024 * 1024) return { error: "Görsel en fazla 3 MB olabilir." };
  if (!matchesImageSignature(new Uint8Array(await file.slice(0, 12).arrayBuffer()), file.type)) return { error: "Geçerli bir JPG, PNG veya WEBP görseli seçin." };
  let uploaded: string | undefined;
  try {
    uploaded = await saveUploadedImage(file);
    await setSlideImage(id, uploaded);
  } catch {
    if (uploaded) await del(uploaded).catch(() => {});
    return { error: "Görsel kaydedilemedi. Lütfen tekrar deneyin." };
  }
  refresh();
  return { success: "Slayt görseli güncellendi.", revision: randomUUID() };
}
export async function resetSlideAction(id: number): Promise<SlideState> {
  await requireAdmin();
  try { await resetSlideImage(id); }
  catch { return { error: "Varsayılan görsele dönülemedi. Lütfen tekrar deneyin." }; }
  refresh();
  return { success: "Varsayılan görsele dönüldü." };
}
