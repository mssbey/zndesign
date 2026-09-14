import Image from "next/image";
import Link from "next/link";
import { Product, categoryName, colorHex, mapsUrl, site } from "@/lib/data";
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "⟶"}</span>;
}
export function Photo({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`photo ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 70vw"
        priority={priority}
      />
    </div>
  );
}
export function Brand() {
  return (
    <span className="brand">
      {site.logo ? (
        <Image
          src={site.logo}
          width={124}
          height={72}
          alt="ZN Design Bedding"
          className="original-logo"
        />
      ) : (
        <>
          <strong>
            ZN <span>Design</span>
          </strong>
          <small>UYKU & YAŞAM</small>
        </>
      )}
    </span>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/urunler/${p.slug}`} className="product-image">
        <Photo
          src={p.image}
          alt={`${p.name} — ${categoryName(p.category)}, temsili görsel`}
        />
        {p.isNew && <span className="tag">YENİ</span>}
      </Link>
      <div className="product-title">
        <Link href={`/urunler/${p.slug}`}>
          <h3>{p.name}</h3>
        </Link>
        <div
          className="swatches"
          aria-label={`Renkler: ${p.colors.join(", ")}`}
        >
          {p.colors.map((c) => (
            <span key={c} style={{ background: colorHex[c] }} title={c} />
          ))}
        </div>
      </div>
      <p>{categoryName(p.category)}</p>
      <Link className="product-link" href={`/urunler/${p.slug}`}>
        Ürünü İncele <Arrow />
      </Link>
    </article>
  );
}
export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard product={p} key={p.slug} />
      ))}
    </div>
  );
}
export function SectionHead({
  eyebrow,
  title,
  href,
  label,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {label || "Tümünü Keşfet"} <Arrow />
        </Link>
      )}
    </div>
  );
}
export function StoreInvite() {
  return (
    <section className="store-invite wrap">
      <p className="eyebrow">İSTANBUL · ESENYURT</p>
      <h2>Konforu yakından keşfedin.</h2>
      <p>{site.address}</p>
      <div className="actions">
        <a className="button" href={mapsUrl} target="_blank" rel="noreferrer">
          Yol Tarifi Al <Arrow diagonal />
        </a>
        <Link className="text-link" href="/iletisim">
          Bizimle İletişime Geç <Arrow />
        </Link>
      </div>
    </section>
  );
}
