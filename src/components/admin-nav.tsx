import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
export function AdminNav() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
      <Link href="/admin" className="text-lg font-semibold">
        ZN Design · Ürün Yönetimi
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/admin/products/new" className="text-sm underline">
          + Yeni Ürün
        </Link>
        <Link href="/" target="_blank" className="text-sm underline">
          Siteyi Görüntüle
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:bg-[var(--cream)]"
          >
            Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  );
}
