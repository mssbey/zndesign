"use client";
import { useActionState } from "react";
import Image from "next/image";
import type { Slide } from "@/lib/slides";
import { saveSlideAction, resetSlideAction, type SlideState } from "@/app/admin/slide-actions";
import styles from "./gallery-admin.module.css";

export function SlideForm({ id, slide, isDefault }: { id: number; slide: Slide; isDefault: boolean }) {
  const [state, action, pending] = useActionState<SlideState, FormData>(async (previous, data) => {
    const next = await saveSlideAction(id, previous, data);
    return { ...next, revision: next.revision ?? previous.revision };
  }, {});
  const [reset, resetAction, resetting] = useActionState(resetSlideAction.bind(null, id), {});
  const prefix = `slide-${id}`;
  return <article className={`${styles.editor} rounded border border-[var(--line)] bg-white p-5`}>
    <Image src={slide.image} alt={slide.label} width={600} height={400} className="mb-5 aspect-[3/2] w-full rounded object-cover" />
    <form action={action} key={state.revision}>
      <fieldset disabled={pending || resetting} className="min-w-0 space-y-4 border-0 p-0">
        <legend className="mb-1 text-lg font-semibold">{id + 1}. slayt · {slide.title} {slide.second}</legend>
        <p className="text-xs text-[var(--muted)]">{slide.label}</p>
        <div><label htmlFor={`${prefix}-image`}>Yeni görsel</label><input id={`${prefix}-image`} type="file" name="image" accept="image/jpeg,image/png,image/webp" required aria-describedby={`${prefix}-help`} className="mt-2 block w-full text-sm" /><p id={`${prefix}-help`} className="mt-2 text-xs text-[var(--muted)]">JPG, PNG veya WEBP · En fazla 3 MB. Yatay (geniş) görseller en iyi sonucu verir.</p></div>
        <button className={`${styles.submit} rounded disabled:opacity-50`} type="submit">{pending ? "Kaydediliyor…" : "Görseli değiştir"}</button>
      </fieldset>
      {state.error && <p role="alert" className={`${styles.error} text-sm`}>{state.error}</p>}
      {state.success && <p role="status" className={`${styles.success} text-sm`}>{state.success}</p>}
    </form>
    {!isDefault && <form action={resetAction} onSubmit={event => { if (!window.confirm("Bu slayt varsayılan görsele dönsün mü?")) event.preventDefault(); }} className="mt-4 border-t border-[var(--line)] pt-4"><button disabled={pending || resetting} className={`${styles.remove} text-sm underline disabled:opacity-50`}>{resetting ? "Geri alınıyor…" : "Varsayılan görsele dön"}</button>{reset.error && <p role="alert" className={`${styles.error} text-sm`}>{reset.error}</p>}</form>}
  </article>;
}
