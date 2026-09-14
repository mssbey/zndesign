import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/db";
import { categoryName } from "@/lib/data";
import { AdminNav } from "@/components/admin-nav";
import { DeleteProductButton } from "@/components/delete-product-button";
import { deleteProductAction } from "@/app/admin/actions";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default function AdminDashboard() {
  const products = getProducts();
  return (
    <>
      <AdminNav />
      <h1 className="mb-1 text-xl font-semibold">Ürünler</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        {products.length} ürün. Açıklama, görsel ve diğer bilgileri düzenlemek
        için bir ürüne tıklayın.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left">
              <th className="py-2 pr-4">Görsel</th>
              <th className="py-2 pr-4">Ürün</th>
              <th className="py-2 pr-4">Kategori</th>
              <th className="py-2 pr-4">Etiketler</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug} className="border-b border-[var(--line)]">
                <td className="py-3 pr-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded bg-[var(--cream)]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/products/${p.slug}/edit`}
                    className="font-medium underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="py-3 pr-4">{categoryName(p.category)}</td>
                <td className="py-3 pr-4 text-xs text-[var(--muted)]">
                  {[p.isNew && "Yeni", p.campaign && "Kampanya"]
                    .filter(Boolean)
                    .join(" · ")}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${p.slug}/edit`}
                      className="text-sm underline"
                    >
                      Düzenle
                    </Link>
                    <DeleteProductButton
                      action={deleteProductAction.bind(null, p.slug)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--muted)]">
                  Henüz ürün yok.{" "}
                  <Link href="/admin/products/new" className="underline">
                    İlk ürünü ekleyin
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
