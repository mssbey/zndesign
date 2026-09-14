import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, site, mapsUrl } from "@/lib/data";
import { getProducts, getProductBySlug } from "@/lib/db";
import {
  Photo,
  ProductGrid,
  SectionHead,
  Arrow,
  StoreInvite,
} from "@/components/shared";
import { Catalog } from "@/components/catalog";
import { ProductDetail } from "@/components/product-detail";
import { RequestForm } from "@/components/request-form";
const pages: Record<string, [string, string]> = {
  urunler: [
    "Ürünler",
    "Baza, başlık, yatak ve uyku setleri. Ölçü, renk ve kumaşa göre koleksiyonumuzu keşfedin.",
  ],
  koleksiyonlar: [
    "Koleksiyonlar",
    "Sade Yaşam, Modern Konfor ve Kids Dünyası koleksiyonlarını inceleyin.",
  ],
  "ozel-uretim": [
    "Özel Ölçü & Özel Üretim",
    "Ölçü, kumaş ve renk tercihlerinizi paylaşın. Yaşam alanınız için alternatifleri birlikte değerlendirelim.",
  ],
  hakkimizda: [
    "Hakkımızda",
    "ZN Design olarak zarafet, konfor ve kaliteli işçiliği bir araya getiriyoruz.",
  ],
  iletisim: [
    "İletişim",
    "ZN Design ile iletişime geçin. Cemal Gürsel Cad. No:3, Esenyurt / İstanbul.",
  ],
  magazamiz: [
    "Mağazamız",
    "ZN Design mağazasını ziyaret edin. Cemal Gürsel Cad. No:3, Esenyurt / İstanbul.",
  ],
};
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const p = slug[0] === "urunler" && slug[1] ? await getProductBySlug(slug[1]) : null;
  const c =
    slug[0] === "koleksiyonlar"
      ? collections.find((c) => c.slug === slug[1])
      : null;
  return {
    title: p?.name || c?.name || pages[slug[0]]?.[0] || "Sayfa bulunamadı",
    description: p?.description || c?.description || pages[slug[0]]?.[1],
    ...(site.domain
      ? {
          alternates: {
            canonical: `${site.domain.replace(/\/$/, "")}/${slug.join("/")}`,
          },
        }
      : {}),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const [page, id] = slug;
  if (slug.length > 2) notFound();
  if (page === "urunler" && !id)
    return (
      <Suspense
        fallback={<div className="wrap section">Ürünler yükleniyor…</div>}
      >
        <Catalog products={await getProducts()} />
      </Suspense>
    );
  if (page === "urunler" && id) {
    const p = await getProductBySlug(id);
    if (!p) notFound();
    const allProducts = await getProducts();
    return (
      <>
        <ProductDetail product={p} />
        <section className="wrap section">
          <SectionHead
            eyebrow="KEŞFETMEYE DEVAM EDİN"
            title="Birbirini tamamlayan seçenekler."
          />
          <ProductGrid
            items={allProducts
              .filter(
                (x) =>
                  x.slug !== id &&
                  (x.category === p.category || x.collection === p.collection),
              )
              .slice(0, 4)}
          />
        </section>
      </>
    );
  }
  if (page === "koleksiyonlar" && !id)
    return (
      <>
        <div className="wrap page-intro">
          <p className="eyebrow">ZN DESIGN KOLEKSİYONLARI</p>
          <h1>Kendi dünyanızı yaratın.</h1>
          <p>
            Birbirini tamamlayan tonlar ve dokular. Yaşamınıza ait bir atmosfer.
          </p>
        </div>
        <div className="wrap collection-list collection-grid">
          {collections.map((c) => (
            <Link
              href={`/koleksiyonlar/${c.slug}`}
              className="collection-card"
              key={c.slug}
            >
              <Photo src={c.image} alt={c.name} />
              <div>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                <span className="round-arrow">
                  <Arrow diagonal />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <StoreInvite />
      </>
    );
  if (page === "koleksiyonlar" && id) {
    const c = collections.find((c) => c.slug === id);
    if (!c) notFound();
    return (
      <>
        <div className="wrap page-intro">
          <nav className="breadcrumb">
            <Link href="/koleksiyonlar">Koleksiyonlar</Link>
            <span>/</span>
            <span>{c.name}</span>
          </nav>
          <p className="eyebrow">ZN DESIGN KOLEKSİYONU</p>
          <h1>{c.name}</h1>
          <p>{c.description}</p>
        </div>
        <div className="wrap collection-cover">
          <Photo src={c.image} alt={c.name} priority />
        </div>
        <section className="wrap section">
          <SectionHead eyebrow="KOLEKSİYONUN PARÇALARI" title={c.subtitle} />
          <ProductGrid
            items={(await getProducts()).filter((p) => p.collection === id)}
          />
        </section>
      </>
    );
  }
  if (id || !pages[page]) notFound();
  if (page === "ozel-uretim")
    return (
      <>
        <section className="wrap editorial-hero">
          <div>
            <p className="eyebrow">ÖZEL ÖLÇÜ & ÖZEL ÜRETİM</p>
            <h1>
              Size özel ölçüler.
              <br />
              <em>Size ait bir tarz.</em>
            </h1>
            <p>
              Ölçü, renk ve kumaş seçenekleri hakkında bizimle görüşerek yaşam
              alanınıza uygun alternatifleri keşfedin.
            </p>
            <a className="text-link" href="#talep">
              Hayalinizi paylaşın <Arrow />
            </a>
          </div>
          <Photo
            src="/images/fabric.webp"
            alt="Keten, bukle ve kadife kumaş seçenekleri"
            priority
          />
        </section>
        <section className="wrap form-layout" id="talep">
          <div>
            <p className="eyebrow">DETAYLARDA SİZ VARSINIZ</p>
            <h2>
              Her tercih,
              <br />
              yeni bir ihtimal.
            </h2>
            <p>
              <b>01 / Ölçü</b>
              <br />
              Odanızın ve ilgilendiğiniz ürünün ölçülerini paylaşın; uygun
              alternatifleri değerlendirelim.
            </p>
            <p>
              <b>02 / Doku & renk</b>
              <br />
              Keten dokulu, bukle veya kadife. Kumaşları mağazamızda yakından
              inceleyin.
            </p>
            <p>
              <b>03 / Son dokunuş</b>
              <br />
              Üretim uygunluğu, süre ve teslimat detayları görüşme sırasında
              netleştirilir.
            </p>
            <Photo src="/images/headboard.webp" alt="Döşemeli başlık detayı" />
          </div>
          <Suspense>
            <RequestForm custom />
          </Suspense>
        </section>
      </>
    );
  if (page === "hakkimizda")
    return (
      <>
        <section className="wrap editorial-hero">
          <div>
            <p className="eyebrow">ZN DESIGN | UYKU & YAŞAM</p>
            <h1>
              Konforun tasarımla
              <br />
              <em>buluştuğu yer.</em>
            </h1>
            <p>
              ZN Design olarak zarafet, konfor ve kaliteli işçiliği bir araya
              getirerek yaşam alanlarınıza değer katan ürünler tasarlıyoruz.
            </p>
          </div>
          <Photo
            src="/images/modern.webp"
            alt="Sıcak tonlarda temsili yatak odası"
            priority
          />
        </section>
        <section className="wrap editorial-body">
          <p className="eyebrow">YAŞAMINIZA DOKUNAN TASARIMLAR</p>
          <h2>
            Güzel bir gün,
            <br />
            iyi hissettiren bir odada başlar.
          </h2>
          <p>
            Baza, başlık, yatak ve uyku setlerimizde modern tasarımı
            fonksiyonellikle buluşturuyor; farklı zevk ve ihtiyaçlara hitap eden
            seçenekler sunuyoruz.
          </p>
          <p>
            Kaliteli malzeme, özenli üretim ve müşteri memnuniyetini merkeze
            alan hizmet anlayışımızla, yatak odalarınız için hem şık hem de
            konforlu çözümler üretiyoruz.
          </p>
          <p>ZN Design — Konforun tasarımla buluştuğu yer.</p>
        </section>
        <StoreInvite />
      </>
    );
  return (
    <>
      <div className="wrap page-intro">
        <p className="eyebrow">
          {page === "magazamiz" ? "İSTANBUL · ESENYURT" : "İLETİŞİM"}
        </p>
        <h1>
          {page === "magazamiz"
            ? "Konforu yakından keşfedin."
            : "Güzel bir başlangıç yapalım."}
        </h1>
        <p>
          Ürünler, kumaşlar ve size özel seçenekler hakkında birlikte konuşalım.
        </p>
      </div>
      <section className="wrap form-layout">
        <div>
          <div className="address-card">
            <p className="eyebrow">ZN DESIGN MAĞAZA</p>
            <h2>Sizi bekliyoruz.</h2>
            <p>{site.address}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="button"
            >
              Yol Tarifi Al <Arrow diagonal />
            </a>
          </div>
          {site.phone && (
            <p>
              <a href={`tel:${site.phone}`}>{site.phone}</a>
            </p>
          )}
          <p className="form-note">
            Ürünleri ve kumaş dokularını mağazamızda yakından keşfedebilirsiniz.
          </p>
        </div>
        {page === "iletisim" ? (
          <Suspense>
            <RequestForm />
          </Suspense>
        ) : (
          <div>
            <p className="eyebrow">BİR EKRANDAN DAHA YAKIN</p>
            <h2>
              Dokunun.
              <br />
              İnceleyin.
              <br />
              <em>Kendiniz hissedin.</em>
            </h2>
            <p>
              Renkleri doğal halleriyle görün, farklı dokuları karşılaştırın.
              Yaşam alanınız için seçenekleri birlikte değerlendirelim.
            </p>
            <Link href="/iletisim" className="text-link">
              Bizimle İletişime Geç <Arrow />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
