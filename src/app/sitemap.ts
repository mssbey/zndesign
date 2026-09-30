import type { MetadataRoute } from "next";
import { site } from "@/lib/data";
import { getCollections } from "@/lib/taxonomy";
import { getProducts } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!site.domain) return [];
  const [products, collections] = await Promise.all([getProducts(), getCollections()]);
  return [
    "",
    "/urunler",
    "/koleksiyonlar",
    "/ozel-uretim",
    "/biz-kimiz",
    "/kumas-renk-kartelasi",
    "/fabrikamiz",
    "/iletisim",
    "/magazamiz",
    ...products.map((p) => `/urunler/${p.slug}`),
    ...collections.map((c) => `/koleksiyonlar/${c.slug}`),
  ].map((path) => ({ url: site.domain.replace(/\/$/, "") + path }));
}
