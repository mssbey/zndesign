"use client";
import { useActionState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/gallery";
import { saveGalleryAction, deleteGalleryAction, type GalleryState } from "@/app/admin/gallery-actions";
import styles from "./gallery-admin.module.css";

export function GalleryForm({ item }: { item?: GalleryItem }) {
  const [state, action, pending] = useActionState<GalleryState, FormData>(async (previous, data) => {
    const next = await saveGalleryAction(item?.id ?? null, previous, data);
    return { ...next, revision: next.revision ?? previous.revision };
  }, {});
  const [deletion, remove, deleting] = useActionState(deleteGalleryAction.bind(null, item?.id ?? ""), {});
  const prefix = item?.id ?? "new";
  return <article className={`${styles.editor} rounded border border-[var(--line)] bg-white p-5`}>
    {item && <Image src={item.src} alt={item.caption} width={600} height={400} className="mb-5 aspect-[3/2] w-full rounded object-cover" />}
    <form action={action} key={state.revision} onReset={event => event.preventDefault()}>
      <fieldset disabled={pending || deleting} className="min-w-0 space-y-4 border-0 p-0">
        <legend className="mb-4 text-lg font-semibold">{item ? "Görseli düzenle" : "Yeni fotoğraf ekle"}</legend>
        <div><label htmlFor={`${prefix}-category`}>Kategori</label><select id={`${prefix}-category`} name="category" defaultValue={item?.category ?? "factory"} className="mt-1 w-full rounded border p-2"><option value="factory">Fabrikamız</option><option value="delivery">Teslimatlarımız</option></select></div>
        <div><label htmlFor={`${prefix}-caption`}>Fotoğraf açıklaması</label><input id={`${prefix}-caption`} name="caption" defaultValue={item?.caption} required maxLength={180} placeholder="Örn. Başlık döşeme atölyemiz" className="mt-1 w-full rounded border p-2" /></div>
        <div><label htmlFor={`${prefix}-position`}>Görüntülenme sırası</label><input id={`${prefix}-position`} type="number" name="position" min={0} max={9999} defaultValue={item?.position ?? 0} required className="mt-1 w-full rounded border p-2" /><p className="mt-1 text-xs text-[var(--muted)]">Küçük sayılar önce gösterilir.</p></div>
        <div><label htmlFor={`${prefix}-image`}>{item ? "Fotoğrafı değiştir (isteğe bağlı)" : "Fotoğraf"}</label><input id={`${prefix}-image`} type="file" name="image" accept="image/jpeg,image/png,image/webp" required={!item} aria-describedby={`${prefix}-help`} className="mt-2 block w-full text-sm" /><p id={`${prefix}-help`} className="mt-2 text-xs text-[var(--muted)]">JPG, PNG veya WEBP · En fazla 3 MB. Yalnızca paylaşım izniniz olan gerçek fabrika ve teslimat fotoğraflarını yükleyin.</p></div>
        <button className={`${styles.submit} rounded disabled:opacity-50`} type="submit">{pending ? "Kaydediliyor…" : item ? "Değişiklikleri kaydet" : "Galeriye ekle"}</button>
      </fieldset>
      {state.error && <p role="alert" className={`${styles.error} text-sm`}>{state.error}</p>}
      {state.success && <p role="status" className={`${styles.success} text-sm`}>{state.success}</p>}
    </form>
    {item && <form action={remove} onSubmit={event => { if (!window.confirm("Bu fotoğraf galeriden kaldırılsın mı?")) event.preventDefault(); }} className="mt-4 border-t border-[var(--line)] pt-4"><button disabled={pending || deleting} className={`${styles.remove} text-sm underline disabled:opacity-50`}>{deleting ? "Kaldırılıyor…" : "Galeriden kaldır"}</button>{deletion.error && <p role="alert" className={`${styles.error} text-sm`}>{deletion.error}</p>}</form>}
  </article>;
}
