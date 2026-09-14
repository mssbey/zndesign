import type { MetadataRoute } from "next";
import { site, collections } from "@/lib/data";
import { getProducts } from "@/lib/db";
export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.domain) return [];
  const products = getProducts();
  return [
    "",
    "/urunler",
    "/koleksiyonlar",
    "/ozel-uretim",
    "/hakkimizda",
    "/iletisim",
    "/magazamiz",
    ...products.map((p) => `/urunler/${p.slug}`),
    ...collections.map((c) => `/koleksiyonlar/${c.slug}`),
  ].map((path) => ({ url: site.domain.replace(/\/$/, "") + path }));
}
