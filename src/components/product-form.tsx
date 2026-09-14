"use client";
import { useActionState } from "react";
import Image from "next/image";
import { categories, collections, type Product } from "@/lib/data";
import type { FormState } from "@/app/admin/actions";
const initialState: FormState = {};
export function ProductForm({
  action,
  product,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const galleryExtra = product?.gallery.slice(1) || [];
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
                src={product.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            Değiştirmek istemiyorsanız boş bırakın.
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Ek galeri görselleri (opsiyonel, birden fazla seçilebilir)
        <input
          type="file"
          name="gallery"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="rounded border border-[var(--line)] px-3 py-2"
        />
        {product && galleryExtra.length > 0 && (
          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            Mevcut galeri:
            {galleryExtra.map((src) => (
              <span
                key={src}
                className="relative inline-block h-10 w-10 overflow-hidden rounded"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
            ))}
            Yeni görsel seçerseniz bunların yerine geçer.
          </span>
        )}
      </label>
      <input
        type="hidden"
        name="existingGalleryExtra"
        value={galleryExtra.join(",")}
      />
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-[var(--ink)] px-5 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : product ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
      </button>
    </form>
  );
}
