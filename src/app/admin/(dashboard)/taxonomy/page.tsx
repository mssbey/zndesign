import { AdminNav } from "@/components/admin-nav";
import { TaxonomyForm } from "@/components/taxonomy-form";
import { countProducts, getCategories, getCollections } from "@/lib/taxonomy";
import styles from "@/components/gallery-admin.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kategoriler ve Koleksiyonlar · Yönetim", robots: { index: false, follow: false } };
export default async function TaxonomyAdmin() {
  const [categories, collections, categoryCounts, collectionCounts] = await Promise.all([
    getCategories(), getCollections(), countProducts("category"), countProducts("collection"),
  ]);
  return <>
    <AdminNav />
    <h1 className={styles.heading}>Kategoriler</h1>
    <p className={styles.intro}>Kategoriler menüde, ana sayfada, ürün filtrelerinde ve talep formunda ↑ ↓ ile belirlediğiniz sırayla gösterilir. Ürünü olan bir kategori silinemez.</p>
    <div className="mb-12 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
      <TaxonomyForm kind="category" />
      {categories.map((c, i) => <TaxonomyForm key={c.slug} kind="category" item={c} productCount={categoryCounts[c.slug] || 0} first={i === 0} last={i === categories.length - 1} />)}
    </div>
    <h1 className={styles.heading}>Koleksiyonlar</h1>
    <p className={styles.intro}>Koleksiyonlar menüde, ana sayfada ve Koleksiyonlar sayfasında gösterilir. &quot;yeni-koleksiyonlar&quot; adresli koleksiyon, &quot;Yeni ürün&quot; işaretli tüm ürünleri otomatik listeler.</p>
    <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
      <TaxonomyForm kind="collection" />
      {collections.map((c, i) => <TaxonomyForm key={c.slug} kind="collection" item={c} productCount={collectionCounts[c.slug] || 0} first={i === 0} last={i === collections.length - 1} />)}
    </div>
  </>;
}
