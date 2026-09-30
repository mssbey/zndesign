"use client";
import { useActionState } from "react";
import Image from "next/image";
import type { Collection } from "@/lib/data";
import type { TaxonomyKind } from "@/lib/taxonomy";
import { saveTaxonomyAction, deleteTaxonomyAction, moveTaxonomyAction, type TaxonomyState } from "@/app/admin/taxonomy-actions";
import styles from "./gallery-admin.module.css";

const noun = { category: "kategori", collection: "koleksiyon" };

export function TaxonomyForm({
  kind,
  item,
  productCount = 0,
  first,
  last,
}: {
  kind: TaxonomyKind;
  item?: Omit<Collection, "subtitle"> & { subtitle?: string };
  productCount?: number;
  first?: boolean;
  last?: boolean;
}) {
  const [state, action, pending] = useActionState<TaxonomyState, FormData>(async (previous, data) => {
    const next = await saveTaxonomyAction(kind, item?.slug ?? null, previous, data);
    return { ...next, revision: next.revision ?? previous.revision };
  }, {});
  const [deletion, remove, deleting] = useActionState(deleteTaxonomyAction.bind(null, kind, item?.slug ?? ""), {});
  const prefix = `${kind}-${item?.slug ?? "new"}`;
  const busy = pending || deleting;
  return <article className={`${styles.editor} rounded border border-[var(--line)] bg-white p-5`}>
    {item && <div className="mb-4 flex items-center gap-3">
      <Image src={item.image} alt="" width={96} height={64} className="h-16 w-24 shrink-0 rounded object-cover" />
      <div className="min-w-0 flex-1 text-xs text-[var(--muted)]">
        <p className="truncate">/{kind === "category" ? `urunler?kategori=${item.slug}` : `koleksiyonlar/${item.slug}`}</p>
        <p>{productCount} ürün</p>
      </div>
      <div className="flex gap-1">
        <form action={moveTaxonomyAction.bind(null, kind, item.slug, -1)}><button disabled={first || busy} aria-label={`${item.name} yukarı taşı`} className="rounded border border-[var(--line)] px-3 disabled:opacity-30">↑</button></form>
        <form action={moveTaxonomyAction.bind(null, kind, item.slug, 1)}><button disabled={last || busy} aria-label={`${item.name} aşağı taşı`} className="rounded border border-[var(--line)] px-3 disabled:opacity-30">↓</button></form>
      </div>
    </div>}
    <form action={action} key={state.revision} onReset={event => event.preventDefault()}>
      <fieldset disabled={busy} className="min-w-0 space-y-4 border-0 p-0">
        <legend className="mb-4 text-lg font-semibold">{item ? item.name : `Yeni ${noun[kind]} ekle`}</legend>
        <div><label htmlFor={`${prefix}-name`}>Ad</label><input id={`${prefix}-name`} name="name" defaultValue={item?.name} required maxLength={80} className="mt-1 w-full rounded border p-2" /></div>
        <div><label htmlFor={`${prefix}-slug`}>URL (slug)</label><input id={`${prefix}-slug`} name="slug" defaultValue={item?.slug} placeholder="boş bırakırsanız addan oluşturulur" className="mt-1 w-full rounded border p-2" />{item && productCount > 0 && <p className="mt-1 text-xs text-[var(--muted)]">Değiştirirseniz {productCount} ürün yeni adrese taşınır; eski bağlantılar çalışmaz.</p>}</div>
        {kind === "collection" && <div><label htmlFor={`${prefix}-subtitle`}>Alt başlık</label><input id={`${prefix}-subtitle`} name="subtitle" defaultValue={item?.subtitle} maxLength={120} placeholder="Örn. Az detay. Çok his." className="mt-1 w-full rounded border p-2" /></div>}
        <div><label htmlFor={`${prefix}-description`}>Açıklama</label><textarea id={`${prefix}-description`} name="description" defaultValue={item?.description} maxLength={400} rows={2} className="mt-1 w-full rounded border p-2 text-sm" /></div>
        <div><label htmlFor={`${prefix}-image`}>{item ? "Görseli değiştir (isteğe bağlı)" : "Görsel (isteğe bağlı)"}</label><input id={`${prefix}-image`} type="file" name="image" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" /></div>
        <button className={`${styles.submit} rounded disabled:opacity-50`} type="submit">{pending ? "Kaydediliyor…" : item ? "Değişiklikleri kaydet" : "Ekle"}</button>
      </fieldset>
      {state.error && <p role="alert" className={`${styles.error} text-sm`}>{state.error}</p>}
      {state.success && <p role="status" className={`${styles.success} text-sm`}>{state.success}</p>}
    </form>
    {item && <form action={remove} onSubmit={event => { if (!window.confirm(`"${item.name}" silinsin mi?`)) event.preventDefault(); }} className="mt-4 border-t border-[var(--line)] pt-4"><button disabled={busy} className={`${styles.remove} text-sm underline disabled:opacity-50`}>{deleting ? "Siliniyor…" : "Sil"}</button>{deletion.error && <p role="alert" className={`${styles.error} text-sm`}>{deletion.error}</p>}</form>}
  </article>;
}
