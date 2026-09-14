import Link from "next/link";
import {
  Arrow,
  Photo,
  ProductGrid,
  SectionHead,
  StoreInvite,
} from "@/components/shared";
import { categories, collections, site } from "@/lib/data";
import { getProducts } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = {
  ...(site.domain
    ? { alternates: { canonical: site.domain.replace(/\/$/, "") } }
    : {}),
};
export default function Home() {
  const products = getProducts();
  const newest = products.filter((p) => p.isNew).slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ZN DESIGN | UYKU & YAŞAM</p>
          <h1>
            Yaşam alanınıza
            <br />
            <em>zarafet.</em>
            <br />
            Uykunuza konfor.
          </h1>
          <p className="hero-description">
            Baza, başlık, yatak ve uyku koleksiyonlarımızla yatak odanız için
            şık ve konforlu seçenekleri keşfedin.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/koleksiyonlar">
              Koleksiyonu Keşfet <Arrow />
            </Link>
            <Link className="text-link" href="/ozel-uretim">
              Özel Üretimi İncele <Arrow diagonal />
            </Link>
          </div>
          <a href="#kategoriler" className="scroll-cue">
            <span>↓</span> KONFORU KEŞFETMEYE BAŞLAYIN
          </a>
        </div>
        <div className="hero-visual">
          <Photo
            src="/images/hero.webp"
            alt="Doğal ışıkta krem döşemeli baza ve başlık, temsili yatak odası"
            priority
          />
          <div className="hero-caption">
            <span>DOĞAL DOKULAR. ZAMANSIZ ÇİZGİLER.</span>
            <span>01 — ZN DESIGN</span>
          </div>
        </div>
      </section>
      <div className="values-strip">
        <span>Özenle seçilen dokular</span>
        <i>✧</i>
        <span>Yaşamınıza uyum sağlayan tasarımlar</span>
        <i>✧</i>
        <span>Size özel seçenekler</span>
      </div>
      <section className="wrap section" id="kategoriler">
        <SectionHead
          eyebrow="YAŞAM ALANINIZ İÇİN"
          title="Konforun farklı halleri."
          href="/urunler"
          label="Tüm Ürünleri Keşfet"
        />
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link
              href={`/urunler?kategori=${c.slug}`}
              className={`category-card category-${i}`}
              key={c.slug}
            >
              <Photo src={c.image} alt={c.name} />
              <div>
                <h3>{c.name}</h3>
                <Arrow diagonal />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="section featured">
        <div className="wrap">
          <SectionHead
            eyebrow="ÖNE ÇIKAN MODELLER"
            title="Yatak odanızın yeni karakteri."
            href="/urunler"
            label="Tüm Modeller"
          />
          <ProductGrid items={products.slice(0, 4)} />
        </div>
      </section>
      <section className="wrap section">
        <SectionHead
          eyebrow="BİR ODADAN DAHA FAZLASI"
          title="Kendi dünyanızı yaratın."
          href="/koleksiyonlar"
          label="Koleksiyonlar"
        />
        <div className="collection-grid">
          {collections.map((c, i) => (
            <Link
              href={`/koleksiyonlar/${c.slug}`}
              className="collection-card"
              key={c.slug}
            >
              <Photo src={c.image} alt={c.name} />
              <div>
                <span className="eyebrow">0{i + 1} / KOLEKSİYON</span>
                <h3>{c.name}</h3>
                <p>{c.subtitle}</p>
                <span className="round-arrow">
                  <Arrow diagonal />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="custom-section">
        <Photo
          src="/images/fabric.webp"
          alt="Krem, keten ve bej döşemelik kumaş dokuları"
        />
        <div className="custom-copy">
          <p className="eyebrow">SİZİN HAYALİNİZ, SİZİN TASARIMINIZ</p>
          <h2>
            Size özel ölçüler.
            <br />
            <em>Size ait bir tarz.</em>
          </h2>
          <p>
            Ölçü, renk ve kumaş seçenekleri hakkında bizimle görüşerek yaşam
            alanınıza uygun alternatifleri keşfedin.
          </p>
          <Link className="button" href="/ozel-uretim">
            Özel Üretim Hakkında Bilgi Al <Arrow />
          </Link>
        </div>
      </section>
      <section className="brand-story wrap">
        <p className="eyebrow">ZN DESIGN FELSEFESİ</p>
        <h2>
          Konforun tasarımla
          <br />
          <em>buluştuğu yer.</em>
        </h2>
        <p>
          Zarafet, konfor ve kaliteli işçiliği bir araya getirerek yaşam
          alanlarınıza değer katan ürünler tasarlıyoruz. Her detayda yaşamınıza
          dokunan bir incelik.
        </p>
        <Link href="/hakkimizda" className="text-link">
          ZN Design’ı Tanıyın <Arrow />
        </Link>
      </section>
      <section className="wrap section new-section">
        <SectionHead
          eyebrow="KEŞFEDİLMEYİ BEKLEYENLER"
          title="Yeni bir dokunuşa yer açın."
          href="/urunler?yeni=1"
          label="Yeni Ürünler"
        />
        <ProductGrid items={newest} />
        <div className="campaign-line">
          <p>Güncel kampanya seçeneklerini merak ediyor musunuz?</p>
          <Link href="/urunler?kampanya=1" className="text-link">
            Kampanyalı Ürünler <Arrow />
          </Link>
        </div>
      </section>
      <StoreInvite />
    </>
  );
}
