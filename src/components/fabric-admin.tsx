"use client";
import { useActionState, useState } from "react";
import { fabricTextures, type FabricGroup } from "@/lib/fabrics";
import { saveFabricsAction, resetFabricsAction, type FabricState } from "@/app/admin/content-actions";
import styles from "./gallery-admin.module.css";

type EditColor = { uid: string; name: string; hex: string; image?: string };
type EditGroup = { uid: string; name: string; note: string; texture: string; colors: EditColor[] };
const uid = () => Math.random().toString(36).slice(2, 10);
const toEdit = (groups: FabricGroup[]): EditGroup[] => groups.map(g => ({ uid: uid(), name: g.name, note: g.note, texture: g.texture, colors: g.colors.map(c => ({ uid: uid(), ...c })) }));
const move = <T,>(list: T[], from: number, to: number) => { const next = [...list]; next.splice(to, 0, ...next.splice(from, 1)); return next; };

export function FabricAdmin({ groups, isDefault }: { groups: FabricGroup[]; isDefault: boolean }) {
  const [state, action, pending] = useActionState<FabricState, FormData>(async (previous, data) => {
    const next = await saveFabricsAction(previous, data);
    return { ...next, revision: next.revision ?? previous.revision };
  }, {});
  const [reset, resetAction, resetting] = useActionState(resetFabricsAction, {});
  return <>
    <FabricEditor key={`${state.revision}-${reset.revision}`} initial={groups} action={action} busy={pending || resetting} pending={pending} />
    {state.error && <p role="alert" className="mt-3 text-sm" style={{ color: "#912e2e" }}>{state.error}</p>}
    {(state.success || reset.success) && !state.error && <p role="status" className="mt-3 text-sm" style={{ color: "#276337" }}>{reset.success && !state.success ? reset.success : state.success}</p>}
    {!isDefault && <form action={resetAction} onSubmit={event => { if (!window.confirm("Tüm kumaş kartelası varsayılan haline dönsün mü? Yaptığınız değişiklikler silinir.")) event.preventDefault(); }} className="mt-6 border-t border-[var(--line)] pt-4"><button disabled={pending || resetting} className="text-sm underline disabled:opacity-50" style={{ color: "#912e2e" }}>{resetting ? "Geri alınıyor…" : "Varsayılan kartelaya dön"}</button>{reset.error && <p role="alert" className="text-sm" style={{ color: "#912e2e" }}>{reset.error}</p>}</form>}
  </>;
}

function FabricEditor({ initial, action, busy, pending }: { initial: FabricGroup[]; action: (data: FormData) => void; busy: boolean; pending: boolean }) {
  const [groups, setGroups] = useState(() => toEdit(initial));
  const updateGroup = (gi: number, patch: Partial<EditGroup>) => setGroups(list => list.map((g, i) => i === gi ? { ...g, ...patch } : g));
  const updateColor = (gi: number, ci: number, patch: Partial<EditColor>) => setGroups(list => list.map((g, i) => i === gi ? { ...g, colors: g.colors.map((c, j) => j === ci ? { ...c, ...patch } : c) } : g));
  const payload = JSON.stringify(groups.map(g => ({ name: g.name, note: g.note, texture: g.texture, colors: g.colors.map(c => ({ uid: c.uid, name: c.name, hex: c.hex, image: c.image })) })));
  return <form action={action}>
    <input type="hidden" name="groups" value={payload} />
    <fieldset disabled={busy} className="min-w-0 space-y-6 border-0 p-0">
      {groups.map((group, gi) => <article key={group.uid} className={`${styles.editor} rounded border border-[var(--line)] bg-white p-5`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "inherit", fontSize: 18, letterSpacing: 0 }}>Kumaş grubu {gi + 1}{group.name ? ` · ${group.name}` : ""}</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <button type="button" className="underline disabled:opacity-40" disabled={gi === 0} onClick={() => setGroups(list => move(list, gi, gi - 1))}>↑ Yukarı</button>
            <button type="button" className="underline disabled:opacity-40" disabled={gi === groups.length - 1} onClick={() => setGroups(list => move(list, gi, gi + 1))}>↓ Aşağı</button>
            <button type="button" className={`${styles.remove} underline disabled:opacity-40`} disabled={groups.length === 1} onClick={() => { if (window.confirm(`"${group.name || "Bu grup"}" kaldırılsın mı?`)) setGroups(list => list.filter((_, i) => i !== gi)); }}>Grubu kaldır</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div><label htmlFor={`${group.uid}-name`}>Kumaş adı</label><input id={`${group.uid}-name`} value={group.name} required maxLength={60} onChange={e => updateGroup(gi, { name: e.target.value })} className="mt-1" /></div>
          <div><label htmlFor={`${group.uid}-texture`}>Doku görünümü</label><select id={`${group.uid}-texture`} value={group.texture} onChange={e => updateGroup(gi, { texture: e.target.value })} className="mt-1">{fabricTextures.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label htmlFor={`${group.uid}-note`}>Kısa açıklama</label><input id={`${group.uid}-note`} value={group.note} maxLength={300} onChange={e => updateGroup(gi, { note: e.target.value })} className="mt-1" /></div>
        </div>
        <p className="text-sm font-semibold" style={{ margin: "24px 0 8px" }}>Renkler ({group.colors.length})</p>
        <ul className="space-y-3">
          {group.colors.map((color, ci) => <li key={color.uid} className="grid items-end gap-3 border-t border-[var(--line)] pt-3 sm:grid-cols-[64px_1fr_110px] lg:grid-cols-[64px_1fr_110px_1.4fr_auto]">
            <span aria-hidden="true" className="block h-14 w-14 rounded border border-[var(--line)] bg-cover bg-center" style={{ backgroundColor: color.hex, backgroundImage: color.image ? `url(${color.image})` : undefined }} />
            <div><label htmlFor={`${color.uid}-name`}>Renk adı</label><input id={`${color.uid}-name`} value={color.name} required maxLength={60} onChange={e => updateColor(gi, ci, { name: e.target.value })} className="mt-1" /></div>
            <div><label htmlFor={`${color.uid}-hex`}>Renk</label><input id={`${color.uid}-hex`} type="color" value={color.hex} onChange={e => updateColor(gi, ci, { hex: e.target.value })} className="mt-1" style={{ padding: 4, cursor: "pointer" }} /></div>
            <div className="min-w-0">
              <label htmlFor={`${color.uid}-file`}>{color.image ? "Kumaş fotoğrafını değiştir" : "Kumaş fotoğrafı (isteğe bağlı)"}</label>
              <input id={`${color.uid}-file`} type="file" name={`file-${color.uid}`} accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm" />
              {color.image && <button type="button" className={`${styles.remove} mt-1 text-xs underline`} onClick={() => updateColor(gi, ci, { image: undefined })}>Fotoğrafı kaldır (renk kullanılır)</button>}
            </div>
            <div className="flex gap-3 pb-2 text-sm">
              <button type="button" aria-label={`${color.name} rengini yukarı taşı`} className="disabled:opacity-40" disabled={ci === 0} onClick={() => updateGroup(gi, { colors: move(group.colors, ci, ci - 1) })}>↑</button>
              <button type="button" aria-label={`${color.name} rengini aşağı taşı`} className="disabled:opacity-40" disabled={ci === group.colors.length - 1} onClick={() => updateGroup(gi, { colors: move(group.colors, ci, ci + 1) })}>↓</button>
              <button type="button" className={`${styles.remove} underline disabled:opacity-40`} disabled={group.colors.length === 1} onClick={() => updateGroup(gi, { colors: group.colors.filter((_, j) => j !== ci) })}>Sil</button>
            </div>
          </li>)}
        </ul>
        <button type="button" className="mt-4 rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:bg-[var(--cream)]" onClick={() => updateGroup(gi, { colors: [...group.colors, { uid: uid(), name: "", hex: "#c4b398" }] })}>+ Renk ekle</button>
      </article>)}
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="rounded border border-[var(--line)] px-4 py-2 text-sm hover:bg-[var(--cream)]" onClick={() => setGroups(list => [...list, { uid: uid(), name: "", note: "", texture: "woven", colors: [{ uid: uid(), name: "", hex: "#e4dfd2" }] }])}>+ Yeni kumaş grubu</button>
        <span className={styles.editor}><button className={`${styles.submit} rounded disabled:opacity-50`} type="submit">{pending ? "Kaydediliyor…" : "Tüm kartelayı kaydet"}</button></span>
      </div>
      <p className="text-xs text-[var(--muted)]">Kumaş fotoğrafları: JPG, PNG veya WEBP · Her biri en fazla 5 MB. Fotoğraf yüklenen renklerde sitede fotoğraf, diğerlerinde seçilen renk ve doku görünümü gösterilir. Değişiklikler &quot;Tüm kartelayı kaydet&quot; ile birlikte yayınlanır.</p>
    </fieldset>
  </form>;
}
