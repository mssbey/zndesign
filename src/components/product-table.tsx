"use client";
import { useOptimistic, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoryName, type Category, type Collection, type Product } from "@/lib/data";
import { deleteProductAction, reorderProductsAction } from "@/app/admin/actions";
import { DeleteProductButton } from "./delete-product-button";

const input = "rounded border border-[var(--line)] px-3 py-2 text-sm";

export function ProductTable({
  products,
  categories,
  collections,
}: {
  products: Product[];
  categories: Category[];
  collections: Collection[];
}) {
  const [list, setOptimisticList] = useOptimistic(products);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [collection, setCollection] = useState("");
  const [tag, setTag] = useState("");

  const q = query.trim().toLocaleLowerCase("tr");
  const visible = list.filter(
    (p) =>
      (!q || p.name.toLocaleLowerCase("tr").includes(q) || p.slug.includes(q)) &&
      (!category || p.category === category) &&
      (!collection || p.collection === collection) &&
      (!tag || (tag === "new" ? p.isNew : tag === "campaign" ? p.campaign : !p.isNew && !p.campaign)),
  );
  const filtered = visible.length !== list.length;

  // Swaps with the neighbouring *visible* product, so ordering also works inside a filtered view.
  function move(slug: string, direction: -1 | 1) {
    const neighbour = visible[visible.findIndex((p) => p.slug === slug) + direction];
    if (!neighbour) return;
    const next = [...list];
    const a = next.findIndex((p) => p.slug === slug);
    const b = next.findIndex((p) => p.slug === neighbour.slug);
    [next[a], next[b]] = [next[b], next[a]];
    setError("");
    startTransition(async () => {
      setOptimisticList(next);
      const result = await reorderProductsAction(next.map((p) => p.slug));
      if (result.error) setError(result.error);
    });
  }

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ürün ara…" aria-label="Ürün ara" className={input} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Kategori filtresi" className={input}>
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={collection} onChange={(e) => setCollection(e.target.value)} aria-label="Koleksiyon filtresi" className={input}>
          <option value="">Tüm koleksiyonlar</option>
          {collections.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Etiket filtresi" className={input}>
          <option value="">Tüm etiketler</option>
          <option value="new">Yeni</option>
          <option value="campaign">Kampanya</option>
          <option value="none">Etiketsiz</option>
        </select>
      </div>
      <p className="mb-3 text-xs text-[var(--muted)]" aria-live="polite">
        {filtered ? `${visible.length} / ${list.length} ürün gösteriliyor. ` : ""}
        ↑ ↓ ile sitedeki sıralamayı değiştirin; ürün listesi ve ana sayfa bu sırayı kullanır.
        {pending && " Kaydediliyor…"}
      </p>
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left">
              <th className="py-2 pr-4">Sıra</th>
              <th className="py-2 pr-4">Görsel</th>
              <th className="py-2 pr-4">Ürün</th>
              <th className="py-2 pr-4">Kategori</th>
              <th className="py-2 pr-4">Etiketler</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => (
              <tr key={p.slug} className="border-b border-[var(--line)]">
                <td className="py-3 pr-4">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(p.slug, -1)} disabled={i === 0} aria-label={`${p.name} yukarı taşı`} className="rounded border border-[var(--line)] px-2 py-1 disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => move(p.slug, 1)} disabled={i === visible.length - 1} aria-label={`${p.name} aşağı taşı`} className="rounded border border-[var(--line)] px-2 py-1 disabled:opacity-30">↓</button>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded bg-[var(--cream)]">
                    <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <Link href={`/admin/products/${p.slug}/edit`} className="font-medium underline">{p.name}</Link>
                </td>
                <td className="py-3 pr-4">{categoryName(categories, p.category)}</td>
                <td className="py-3 pr-4 text-xs text-[var(--muted)]">
                  {[p.isNew && "Yeni", p.campaign && "Kampanya"].filter(Boolean).join(" · ")}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.slug}/edit`} className="text-sm underline">Düzenle</Link>
                    <DeleteProductButton action={deleteProductAction.bind(null, p.slug)} />
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--muted)]">
                  {list.length === 0 ? (
                    <>Henüz ürün yok. <Link href="/admin/products/new" className="underline">İlk ürünü ekleyin</Link>.</>
                  ) : (
                    "Filtrelere uyan ürün yok."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
