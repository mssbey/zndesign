import { put, del } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { MAX_REFERENCE_BYTES, matchesImageSignature, validateReferenceImages } from "@/lib/reference-images";

export const runtime = "nodejs";
// Per-instance protection; configure a deployment-level rate limit for public production traffic.
const attempts = new Map<string, { count: number; reset: number }>();
const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return fail("İstek doğrulanamadı. Sayfayı yenileyerek tekrar deneyin.", 403);
  const now = Date.now();
  for (const [key, value] of attempts) if (value.reset < now) attempts.delete(key);
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rate = attempts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (rate.count >= 10 || attempts.size > 10000) return fail("Çok sık yükleme yapıldı. Bir süre sonra tekrar deneyin veya görselleri doğrudan paylaşın.", 429);
  rate.count++; attempts.set(ip, rate);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return fail("Görsel bağlantısı oluşturma şu anda kullanılamıyor. Talebinizi hazırlayıp görselleri doğrudan paylaşabilirsiniz.", 503);
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data;")) return fail("Geçersiz yükleme biçimi.", 400);
  const limit = MAX_REFERENCE_BYTES + 64 * 1024;
  if (Number(request.headers.get("content-length")) > limit) return fail("Toplam görsel boyutu 3 MB’ı aşmamalıdır.", 413);
  const urls: string[] = [];
  try {
    // Bound the actual stream as well as Content-Length to avoid oversized/chunked uploads.
    const reader = request.body?.getReader();
    if (!reader) return fail("Görsel seçilmedi.", 400);
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); return fail("Toplam görsel boyutu 3 MB’ı aşmamalıdır.", 413); }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks);
    const form = await new Response(body, { headers: { "content-type": contentType } }).formData();
    if (form.get("consent") !== "yes") return fail("Görsel paylaşım izni gereklidir.", 400);
    const entries = form.getAll("images");
    if (entries.some(entry => !(entry instanceof File))) return fail("Geçersiz görsel.", 400);
    const files = entries as File[];
    const error = validateReferenceImages(files);
    if (error) return fail(error, 400);
    for (const file of files) {
      if (!matchesImageSignature(new Uint8Array(await file.slice(0, 12).arrayBuffer()), file.type)) return fail("Dosya içeriği görsel biçimiyle eşleşmiyor. JPG, PNG veya WEBP kullanın.", 400);
    }
    const requestId = randomUUID();
    for (const [index, file] of files.entries()) {
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
      const blob = await put(`references/${requestId}/${index + 1}.${ext}`, file, { access: "public", addRandomSuffix: false, contentType: file.type });
      urls.push(blob.url);
    }
    return Response.json({ requestId, urls }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    if (urls.length) await del(urls).catch(() => {});
    return fail("Görseller yüklenemedi. Seçimleriniz korunuyor; yeniden deneyin veya doğrudan paylaşın.", 500);
  }
}
