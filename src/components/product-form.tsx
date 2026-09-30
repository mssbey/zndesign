"use client";
import { useActionState, useState } from "react";
import Image from "next/image";
import type { Category, Collection, Product } from "@/lib/data";
import type { FormState } from "@/app/admin/actions";
const initialState: FormState = {};
export function ProductForm({
  action,
  product,
  categories,
  collections,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  product?: Product;
  categories: Category[];
  collections: Collection[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [cover, setCover] = useState(product?.image || "");
  const [galleryExtra, setGalleryExtra] = useState(
    () => product?.gallery.filter((src) => src !== product.image) || [],
  );
  function moveImage(index: number, direction: -1 | 1) {
    const next = [...galleryExtra];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setGalleryExtra(next);
  }
  function makeCover(index: number) {
    // The previous cover takes the chosen image's place in the gallery.
    const next = [...galleryExtra];
    next[index] = cover;
    setCover(galleryExtra[index]);
    setGalleryExtra(next);
  }
  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <label className="flex flex-col gap-1 text-sm">
        Ürün adı
        <input
          type="text"
          name="name"
          required
          defaultValue={product?.name}
          className="rounded border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        URL (slug)
        <input
          type="text"
          name="slug"
          placeholder="boş bırakırsanız ürün adından oluşturulur"
          defaultValue={product?.slug}
          className="rounded border border-[var(--line)] px-3 py-2"
        />
        <span className="text-xs text-[var(--muted)]">
          Örn. /urunler/mini-luna — sadece küçük harf, rakam ve tire.
        </span>
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Kategori
          <select
            name="category"
            required
            defaultValue={product?.category || ""}
            className="rounded border border-[var(--line)] px-3 py-2"
          >
            <option value="" disabled>
              Seçin
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Koleksiyon
          <select
            name="collection"
            required
            defaultValue={product?.collection || ""}
            className="rounded border border-[var(--line)] px-3 py-2"
          >
            <option value="" disabled>
              Seçin
            </option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Açıklama
        <textarea
          name="description"
          rows={4}
          required
          defaultValue={product?.description}
          className="rounded border border-[var(--line)] px-3 py-2"
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Ölçüler
          <input
            type="text"
            name="sizes"
            placeholder="140 × 200 cm, 160 × 200 cm"
            defaultValue={product?.sizes.join(", ")}
            className="rounded border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Renkler
          <input
            type="text"
            name="colors"
            placeholder="Krem, Bej"
            defaultValue={product?.colors.join(", ")}
            className="rounded border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Kumaşlar
          <input
            type="text"
            name="fabrics"
            placeholder="Keten dokulu, Kadife"
            defaultValue={product?.fabrics.join(", ")}
            className="rounded border border-[var(--line)] px-3 py-2"
          />
        </label>
      </div>
      <span className="text-xs text-[var(--muted)]">
        Ölçü, renk ve kumaşları virgülle ayırarak yazın.
      </span>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isNew"
            defaultChecked={product?.isNew}
          />
          Yeni ürün
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="campaign"
            defaultChecked={product?.campaign}
          />
          Kampanyalı
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Kapak görseli {!product && "(zorunlu)"}
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required={!product}
          className="rounded border border-[var(--line)] px-3 py-2"
        />
        {product && (
          <span className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)]">
            Mevcut:
            <span className="relative inline-block h-10 w-10 overflow-hidden rounded">
              <Image
                src={cover}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            Değiştirmek istemiyorsanız boş bırakın. Galerideki bir görseli
            aşağıdan kapak yapabilirsiniz.
          </span>
        )}
      </label>
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1">Ek galeri görselleri</legend>
        {galleryExtra.length > 0 ? (
          <ul className="flex flex-wrap gap-3">
            {galleryExtra.map((src, i) => (
              <li
                key={src}
                className="flex w-28 flex-col gap-1 rounded border border-[var(--line)] p-1.5"
              >
                <span className="relative block aspect-square w-full overflow-hidden rounded">
                  <Image src={src} alt={`Galeri görseli ${i + 1}`} fill sizes="112px" className="object-cover" />
                </span>
                <span className="flex justify-between">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label={`Görsel ${i + 1} sola taşı`} className="rounded border border-[var(--line)] px-2 disabled:opacity-30">←</button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === galleryExtra.length - 1} aria-label={`Görsel ${i + 1} sağa taşı`} className="rounded border border-[var(--line)] px-2 disabled:opacity-30">→</button>
                  <button type="button" onClick={() => setGalleryExtra(galleryExtra.filter((x) => x !== src))} aria-label={`Görsel ${i + 1} kaldır`} className="rounded border border-[var(--line)] px-2 text-red-600">×</button>
                </span>
                <button type="button" onClick={() => makeCover(i)} className="text-xs underline">Kapak yap</button>
              </li>
            ))}
          </ul>
        ) : (
          product && <span className="text-xs text-[var(--muted)]">Galeride kapak dışında görsel yok.</span>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--muted)]">
            Yeni görsel ekle (birden fazla seçilebilir; mevcut görsellerin sonuna eklenir)
          </span>
          <input
            type="file"
            name="gallery"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="rounded border border-[var(--line)] px-3 py-2"
          />
        </label>
        {product && (
          <span className="text-xs text-[var(--muted)]">
            Sıralama, kaldırma ve kapak değişiklikleri &quot;Değişiklikleri Kaydet&quot; ile uygulanır.
          </span>
        )}
      </fieldset>
      <input
        type="hidden"
        name="existingGalleryExtra"
        value={JSON.stringify(galleryExtra)}
      />
      <input type="hidden" name="existingCover" value={cover} />
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-[var(--ink)] px-5 py-2 text-sm text-white! disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : product ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
      </button>
    </form>
  );
}
