"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { categories, categoryName, Product } from "@/lib/data";
import { ProductGrid } from "./shared";
export function Catalog({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const get = (k: string) => params.get(k) || "";
  function change(key: string, value: string) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    window.history.replaceState(
      null,
      "",
      `/urunler${next.size ? "?" + next.toString() : ""}`,
    );
  }
  const visible = products
    .filter(
      (p) =>
        (!get("q") ||
          p.name
            .toLocaleLowerCase("tr")
            .includes(get("q").toLocaleLowerCase("tr"))) &&
        (!get("kategori") || p.category === get("kategori")) &&
        (!get("olcu") || p.sizes.includes(get("olcu"))) &&
        (!get("renk") || p.colors.includes(get("renk"))) &&
        (!get("kumas") || p.fabrics.includes(get("kumas"))) &&
        (!get("yeni") || p.isNew) &&
        (!get("kampanya") || p.campaign),
    )
    .sort((a, b) =>
      get("sirala") === "az"
        ? a.name.localeCompare(b.name, "tr")
        : get("sirala") === "za"
          ? b.name.localeCompare(a.name, "tr")
          : b.added.localeCompare(a.added),
    );
  const active = Array.from(params.entries()).filter(([k]) => k !== "sirala");
  return (
    <>
      <div className="page-intro wrap">
        <p className="eyebrow">ZN DESIGN KOLEKSİYONU</p>
        <h1>
          {get("kategori")
            ? categoryName(get("kategori"))
            : get("kampanya")
              ? "Kampanyalı Ürünler"
              : get("yeni")
                ? "Yeni Ürünler"
                : "Konforunuzu keşfedin."}
        </h1>
        <p>
          {categories.find((c) => c.slug === get("kategori"))?.description ||
            "Yaşam alanınıza uyum sağlayan çizgiler, dokular ve seçenekler. Size ait olanı bulun."}
        </p>
      </div>
      <div className="wrap">
        <button
          className="filter-toggle"
          aria-expanded={open}
          aria-controls="filters"
          onClick={() => setOpen(!open)}
        >
          {open ? "Filtreleri Kapat −" : "Filtrele +"}
        </button>
      </div>
      <div className="wrap catalog-layout">
        <aside id="filters" className={`filter-panel ${open ? "visible" : ""}`}>
          <h2>ÜRÜNLERİ FİLTRELE</h2>
          <label>
            Ürün ara
            <input
              type="search"
              placeholder="Model adı..."
              value={get("q")}
              onChange={(e) => change("q", e.target.value)}
            />
          </label>
          <label>
            Kategori
            <select
              value={get("kategori")}
              onChange={(e) => change("kategori", e.target.value)}
            >
              <option value="">Tüm kategoriler</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {(["olcu", "renk", "kumas"] as const).map((key, i) => (
            <label key={key}>
              {["Ölçü", "Renk", "Kumaş"][i]}
              <select
                value={get(key)}
                onChange={(e) => change(key, e.target.value)}
              >
                <option value="">Tüm seçenekler</option>
                {Array.from(
                  new Set(
                    products.flatMap((p) =>
                      key === "olcu"
                        ? p.sizes
                        : key === "renk"
                          ? p.colors
                          : p.fabrics,
                    ),
                  ),
                ).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
          <label>
            <input
              type="checkbox"
              checked={!!get("yeni")}
              onChange={(e) => change("yeni", e.target.checked ? "1" : "")}
            />
            Yeni ürünler
          </label>
          <label>
            <input
              type="checkbox"
              checked={!!get("kampanya")}
              onChange={(e) => change("kampanya", e.target.checked ? "1" : "")}
            />
            Kampanyalı ürünler
          </label>
          <button
            className="reset-button"
            onClick={() => window.history.replaceState(null, "", "/urunler")}
          >
            Tüm filtreleri temizle
          </button>
        </aside>
        <div>
          <div className="catalog-bar">
            <span aria-live="polite">{visible.length} ürün bulundu</span>
            <label>
              <span className="sr-only">Sıralama</span>
              <select
                value={get("sirala")}
                onChange={(e) => change("sirala", e.target.value)}
              >
                <option value="">Yeni eklenenler</option>
                <option value="az">Model adı: A–Z</option>
                <option value="za">Model adı: Z–A</option>
              </select>
            </label>
          </div>
          {active.length > 0 && (
            <div className="active-filters">
              {active.map(([k, v]) => (
                <button key={k} onClick={() => change(k, "")}>
                  {k === "kategori"
                    ? categoryName(v)
                    : k === "yeni"
                      ? "Yeni ürünler"
                      : k === "kampanya"
                        ? "Kampanyalı ürünler"
                        : v}{" "}
                  ×
                </button>
              ))}
            </div>
          )}
          {visible.length ? (
            <ProductGrid items={visible} />
          ) : (
            <div className="empty-state">
              <h2>
                {get("kampanya")
                  ? "Yeni fırsatlara yer açıyoruz."
                  : "Aradığınız ürün bulunamadı."}
              </h2>
              <p>
                {get("kampanya")
                  ? "Şu anda yayınlanan bir kampanya bulunmuyor. Güncel seçenekler için bizimle iletişime geçebilirsiniz."
                  : "Filtreleri değiştirerek veya farklı bir model adıyla tekrar deneyin."}
              </p>
              <button
                className="button"
                onClick={() => window.history.replaceState(null, "", "/urunler")}
              >
                Tüm Ürünleri Gör
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
