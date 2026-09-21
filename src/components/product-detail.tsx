"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Product, categoryName, colorHex } from "@/lib/data";
import { productMessage, whatsappUrl } from "@/lib/contact";
import { Photo, Arrow } from "./shared";
export function ProductDetail({ product: p }: { product: Product }) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const zoom = useRef<HTMLButtonElement>(null);
  const gallery = p.gallery;
  function contact() {
    window.location.assign(
      whatsappUrl(
        productMessage(
          p.name,
          size,
          color,
          fabric,
          window.location.origin + window.location.pathname,
        ),
      ),
    );
  }
  function close() {
    dialog.current?.close();
    zoom.current?.focus();
  }
  return (
    <div className="wrap detail-page">
      <nav className="breadcrumb" aria-label="İçerik yolu">
        <Link href="/">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/urunler">Ürünler</Link>
        <span>/</span>
        <Link href={`/urunler?kategori=${p.category}`}>
          {categoryName(p.category)}
        </Link>
        <span>/</span>
        <span>{p.name}</span>
      </nav>
      <div className="detail-grid">
        <div>
          <button
            className="gallery-main"
            ref={zoom}
            onClick={() => dialog.current?.showModal()}
            aria-label="Ürün görselini büyüt"
          >
            <Photo
              src={gallery[index]}
              alt={`${p.name}, temsili ürün görseli`}
              priority
            />
            <span className="zoom-hint">Görseli büyüt &gt;</span>
          </button>
          <div className="thumbnails" aria-label="Ürün galerisi">
            {gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}. görsel`}
                aria-pressed={index === i}
              >
                <Photo
                  src={src}
                  alt={`${p.name} ${i === 0 ? "genel görünüm" : "detay"}`}
                />
              </button>
            ))}
          </div>
          <p className="form-note">
            Görseller temsilidir. Renk ve kumaş seçimi fotoğrafı değiştirmez.
          </p>
        </div>
        <div className="detail-info">
          <p className="eyebrow">
            {categoryName(p.category).toLocaleUpperCase("tr")}
          </p>
          <h1>{p.name}</h1>
          <p>{p.description}</p>
          {[
            { title: "Ölçü", values: p.sizes, current: size, set: setSize },
            { title: "Renk", values: p.colors, current: color, set: setColor },
            {
              title: "Kumaş",
              values: p.fabrics,
              current: fabric,
              set: setFabric,
            },
          ].map((o) => (
            <fieldset key={o.title}>
              <legend>
                {o.title}
                {o.current && ` · ${o.current}`}
              </legend>
              <div className="options">
                {o.values.map((v) => (
                  <button
                    key={v}
                    aria-pressed={o.current === v}
                    onClick={() => o.set(o.current === v ? "" : v)}
                  >
                    {colorHex[v] && (
                      <span
                        className="color-dot"
                        style={{ background: colorHex[v] }}
                      />
                    )}
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <p>Fiyat ve seçenekler için bizimle iletişime geçin.</p>
          <button className="button" onClick={contact}>
            WhatsApp’tan Bilgi ve Fiyat Al <Arrow />
          </button>
          <Link
            className="text-link"
            href={`/ozel-uretim?urun=${encodeURIComponent(p.name)}&kategori=${p.category}`}
          >
            Özel Ölçü Talep Et <Arrow diagonal />
          </Link>
          <div className="details-accordion">
            <details open>
              <summary>Ürün özellikleri</summary>
              <p>
                {categoryName(p.category)} · {p.name}. Sunulan ölçü, renk ve
                kumaş alternatiflerinin uygunluğunu mağazamızla görüşerek
                doğrulayabilirsiniz.
              </p>
            </details>
            <details>
              <summary>Bakım bilgileri</summary>
              <p>
                Bakım yöntemi seçilen kumaş ve malzemeye göre değişir. Ürüne
                uygun temizlik ve bakım talimatlarını mağazamızdan isteyin.
              </p>
            </details>
            <details>
              <summary>Teslimat ve kurulum</summary>
              <p>
                Adresinize göre teslimat, kurulum ve süre bilgilerini görüşmemiz
                sırasında öğrenebilirsiniz.
              </p>
              <button
                className="text-link reset-button"
                onClick={() =>
                  window.location.assign(
                    whatsappUrl(
                      `${p.name} için teslimat ve kurulum hakkında bilgi almak istiyorum.`,
                    ),
                  )
                }
              >
                Bilgi talep edin <Arrow />
              </button>
            </details>
          </div>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`${p.name} görsel galerisi`}
        onCancel={() => zoom.current?.focus()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setIndex((index + 1) % gallery.length);
          if (e.key === "ArrowLeft")
            setIndex((index + gallery.length - 1) % gallery.length);
        }}
      >
        <div className="lightbox-controls">
          <button
            onClick={() =>
              setIndex((index + gallery.length - 1) % gallery.length)
            }
            aria-label="Önceki görsel"
          >
            &lt;
          </button>
          <span>
            {p.name} · {index + 1} / {gallery.length}
          </span>
          <button
            onClick={() => setIndex((index + 1) % gallery.length)}
            aria-label="Sonraki görsel"
          >
            &gt;
          </button>
          <button onClick={close} autoFocus>
            Kapat ✕
          </button>
        </div>
        <Photo src={gallery[index]} alt={`${p.name} büyütülmüş görsel`} />
      </dialog>
      <div className="mobile-product-bar">
        <strong>{p.name}</strong>
        <button className="button" onClick={contact}>
          WhatsApp’tan Bilgi Al <Arrow />
        </button>
      </div>
    </div>
  );
}
