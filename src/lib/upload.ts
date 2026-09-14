import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const maxBytes = 8 * 1024 * 1024;

export async function saveUploadedImage(file: File): Promise<string> {
  const ext = extensionByType[file.type];
  if (!ext) {
    throw new Error(
      `Desteklenmeyen görsel türü (${file.type || "bilinmiyor"}). JPG, PNG veya WEBP kullanın.`,
    );
  }
  if (file.size > maxBytes) {
    throw new Error("Görsel 8MB'tan büyük olamaz.");
  }
  const filename = `${randomUUID()}.${ext}`;
  const blob = await put(`uploads/${filename}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}
