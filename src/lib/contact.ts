import { site } from "./data";
export function whatsappUrl(message: string, number = site.whatsapp) {
  const digits = number.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `/iletisim?mesaj=${encodeURIComponent(message)}`;
}
export function productMessage(
  name: string,
  size: string,
  color: string,
  fabric: string,
  url: string,
) {
  return [
    `Merhaba, ZN Design sitesinde gördüğüm ${name} hakkında bilgi ve fiyat almak istiyorum.`,
    size && `Ölçü: ${size}`,
    [color, fabric].filter(Boolean).length &&
      `Renk/Kumaş: ${[color, fabric].filter(Boolean).join(" / ")}`,
    url && `Ürün bağlantısı: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");
}
