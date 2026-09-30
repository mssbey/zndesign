import { AdminNav } from "@/components/admin-nav";
import { ProductForm } from "@/components/product-form";
import { createProductAction } from "@/app/admin/actions";
import { getCategories, getCollections } from "@/lib/taxonomy";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([getCategories(), getCollections()]);
  return (
    <>
      <AdminNav />
      <h1 className="mb-6 text-xl font-semibold">Yeni Ürün Ekle</h1>
      <ProductForm action={createProductAction} categories={categories} collections={collections} />
    </>
  );
}
