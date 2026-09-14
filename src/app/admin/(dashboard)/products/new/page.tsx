import { AdminNav } from "@/components/admin-nav";
import { ProductForm } from "@/components/product-form";
import { createProductAction } from "@/app/admin/actions";
export const metadata = { robots: { index: false, follow: false } };
export default function NewProductPage() {
  return (
    <>
      <AdminNav />
      <h1 className="mb-6 text-xl font-semibold">Yeni Ürün Ekle</h1>
      <ProductForm action={createProductAction} />
    </>
  );
}
