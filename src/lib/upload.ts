import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
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
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
