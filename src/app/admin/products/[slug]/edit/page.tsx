import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { ProductForm } from "@/components/product-form";
import { getProductBySlug } from "@/lib/db";
import { updateProductAction } from "@/app/admin/actions";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const action = updateProductAction.bind(null, slug);
  return (
    <>
      <AdminNav />
      <h1 className="mb-6 text-xl font-semibold">{product.name} — Düzenle</h1>
      <ProductForm action={action} product={product} />
    </>
  );
}
