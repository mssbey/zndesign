import { getProducts } from "@/lib/db";
import { getCategories, getCollections } from "@/lib/taxonomy";
import { AdminNav } from "@/components/admin-nav";
import { ProductTable } from "@/components/product-table";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminDashboard() {
  const [products, categories, collections] = await Promise.all([getProducts(), getCategories(), getCollections()]);
  return (
    <>
      <AdminNav />
      <h1 className="mb-1 text-xl font-semibold">Ürünler</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        {products.length} ürün. Açıklama, görsel ve diğer bilgileri düzenlemek
        için bir ürüne tıklayın.
      </p>
      <ProductTable products={products} categories={categories} collections={collections} />
    </>
  );
}
