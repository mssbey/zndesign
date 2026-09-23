export const MAX_REFERENCE_FILES = 5;
export const MAX_REFERENCE_BYTES = 3 * 1024 * 1024;
export const REFERENCE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateReferenceImages(files: File[]): string | null {
  if (!files.length || files.length > MAX_REFERENCE_FILES) return "En fazla 5 görsel seçebilirsiniz.";
  if (files.some(file => !REFERENCE_TYPES.includes(file.type) || file.size === 0)) return "Lütfen geçerli JPG, PNG veya WEBP görselleri seçin.";
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_REFERENCE_BYTES) return "Görsellerin toplam boyutu 3 MB’ı aşmamalıdır. Daha küçük görseller seçin.";
  return null;
}

export function matchesImageSignature(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return [137,80,78,71,13,10,26,10].every((v, i) => bytes[i] === v);
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}
