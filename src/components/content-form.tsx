"use client";
import { useActionState } from "react";
import Image from "next/image";
import type { ContentSection, ContentValues } from "@/lib/content-sections";
import { saveContentAction, resetContentAction, type ContentState } from "@/app/admin/content-actions";
import styles from "./gallery-admin.module.css";

export function ContentForm({ section, values }: { section: ContentSection; values: ContentValues }) {
  const [state, action, pending] = useActionState<ContentState, FormData>(async (previous, data) => {
    const next = await saveContentAction(section.id, previous, data);
    return { ...next, revision: next.revision ?? previous.revision };
  }, {});
  const [reset, resetAction, resetting] = useActionState(resetContentAction.bind(null, section.id), {});
  const isDefault = section.fields.every(field => values[field.key] === section.defaults[field.key]);
  const prefix = section.id;
  return <article className={`${styles.editor} rounded border border-[var(--line)] bg-white p-5`}>
    {/* Remount after save or reset so inputs pick up the refreshed values. */}
    <form action={action} key={`${state.revision}-${reset.revision}`}>
      <fieldset disabled={pending || resetting} className="min-w-0 space-y-4 border-0 p-0">
        <legend className="mb-1 text-lg font-semibold">{section.title}</legend>
        {section.hint && <p className="text-xs text-[var(--muted)]">{section.hint}</p>}
        {section.fields.map(field => {
          const id = `${prefix}-${field.key}`;
          const help = field.type === "image" ? "JPG, PNG veya WEBP · En fazla 5 MB. Boş bırakırsanız mevcut görsel korunur." : field.help;
          return <div key={field.key}>
            <label htmlFor={id}>{field.label}</label>
            {field.type === "image" ? <>
              <Image src={values[field.key]} alt="" width={600} height={400} className="mt-2 aspect-[3/2] w-full rounded object-cover" />
              <input id={id} type="file" name={field.key} accept="image/jpeg,image/png,image/webp" aria-describedby={`${id}-help`} className="mt-2 block w-full text-sm" />
            </> : field.type === "textarea"
              ? <textarea id={id} name={field.key} defaultValue={values[field.key]} rows={Math.min(8, Math.max(3, Math.ceil(values[field.key].length / 60)))} aria-describedby={help ? `${id}-help` : undefined} className="mt-1" />
              : <input id={id} name={field.key} defaultValue={values[field.key]} aria-describedby={help ? `${id}-help` : undefined} className="mt-1" />}
            {help && <p id={`${id}-help`} className="mt-1 text-xs text-[var(--muted)]">{help}</p>}
          </div>;
        })}
        <button className={`${styles.submit} rounded disabled:opacity-50`} type="submit">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
      </fieldset>
      {state.error && <p role="alert" className={`${styles.error} text-sm`}>{state.error}</p>}
      {state.success && <p role="status" className={`${styles.success} text-sm`}>{state.success}</p>}
    </form>
    {!isDefault && <form action={resetAction} onSubmit={event => { if (!window.confirm(`"${section.title}" varsayılan içeriğe dönsün mü?`)) event.preventDefault(); }} className="mt-4 border-t border-[var(--line)] pt-4"><button disabled={pending || resetting} className={`${styles.remove} text-sm underline disabled:opacity-50`}>{resetting ? "Geri alınıyor…" : "Varsayılana dön"}</button>{reset.error && <p role="alert" className={`${styles.error} text-sm`}>{reset.error}</p>}</form>}
    {reset.success && isDefault && <p role="status" className={`${styles.success} text-sm`}>{reset.success}</p>}
  </article>;
}
