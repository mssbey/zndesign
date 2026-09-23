import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { collections, collectionAliases, site, mapsUrl } from "@/lib/data";
import { FabricCatalog } from "@/components/fabric-catalog";
import { FactoryGallery } from "@/components/factory-gallery";
import { whatsappUrl } from "@/lib/contact";
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
    "Modern, Luxury, Bohem, Rustic, Kids ve yeni koleksiyonlarımızı keşfedin.",
  ],
  "ozel-uretim": [
    "Özel Ölçü & Özel Üretim",
    "Ölçü, kumaş ve renk tercihlerinizi paylaşın. Yaşam alanınız için alternatifleri birlikte değerlendirelim.",
  ],
  "biz-kimiz": [
    "Biz Kimiz",
    "Zenn Bedding olarak zarafet, konfor ve kaliteli işçiliği bir araya getiriyoruz.",
  ],
  "kumas-renk-kartelasi": ["Kumaş & Renk Kartelası", "Baby Face, Luna, Teddy, Puffy, Muzzy, Anka, Coco ve Bukle kumaş gruplarını keşfedin."],
  fabrikamiz: ["Fabrikamız", "Zenn Bedding üretim tesisini ziyaret edin. Ölçü, kumaş, renk ve tasarım seçeneklerini doğrudan üreticinizle değerlendirin."],
  iletisim: [
    "İletişim",
    "Zenn Bedding ile iletişime geçin. Cemal Gürsel Cad. No:3, Esenyurt / İstanbul.",
  ],
  magazamiz: [
    "Mağazamız",
    "Zenn Bedding mağazasını ziyaret edin. Cemal Gürsel Cad. No:3, Esenyurt / İstanbul.",
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
  if (page === "hakkimizda" && !id) permanentRedirect("/biz-kimiz");
  if (page === "koleksiyonlar" && id && collectionAliases[id]) permanentRedirect(`/koleksiyonlar/${collectionAliases[id]}`);
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
          <p className="eyebrow">Zenn Bedding KOLEKSİYONLARI</p>
          <h1>Kendi dünyanızı yaratın.</h1>
          <p>
            Birbirini tamamlayan tonlar ve dokular. Yaşamınıza ait bir atmosfer.
          </p>
        </div>
        <div className="wrap zenn-vertical-list collection-directory">
          {collections.map((c) => (
            <Link
              href={`/koleksiyonlar/${c.slug}`}
              key={c.slug}
            >
              <div>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
              </div>
              <Arrow diagonal />
            </Link>
          ))}
        </div>
        <StoreInvite />
      </>
    );
  if (page === "koleksiyonlar" && id) {
    const c = collections.find((c) => c.slug === id);
    if (!c) notFound();
    const items = (await getProducts()).filter(p => id === "yeni-koleksiyonlar" ? p.isNew : p.collection === id);
    return (
      <>
        <div className="wrap page-intro">
          <nav className="breadcrumb">
            <Link href="/koleksiyonlar">Koleksiyonlar</Link>
            <span>/</span>
            <span>{c.name}</span>
          </nav>
          <p className="eyebrow">Zenn Bedding KOLEKSİYONU</p>
          <h1>{c.name}</h1>
          <p>{c.description}</p>
        </div>
        <div className="wrap collection-cover">
          <Photo src={c.image} alt={c.name} priority />
        </div>
        <section className="wrap section">
          <SectionHead eyebrow="KOLEKSİYONUN PARÇALARI" title={c.subtitle} />
          {items.length ? <ProductGrid items={items}/> : <div className="empty-state"><h2>Bu tarzı birlikte tasarlayalım.</h2><p>Bu koleksiyonun modelleri henüz yayınlanmadı. Size özel tasarım ve üretim seçenekleri için bizimle görüşebilirsiniz.</p><Link className="button" href="/ozel-uretim">Özel Üretim Talebi Oluştur <Arrow /></Link></div>}
        </section>
      </>
    );
  }
  if (id || !pages[page]) notFound();
  if (page === "kumas-renk-kartelasi") return <FabricCatalog/>;
  if (page === "fabrikamiz") return <>
    <div className="wrap page-intro"><p className="eyebrow">DOĞRUDAN ÜRETİCİNİZLE TANIŞIN</p><h1>Üretimi yerinde görün,<br/><em>birlikte tasarlayalım.</em></h1><p>Ürünlerimizi kendi tesisimizde üretiyoruz. Sizi, üretimimizi tanımaya ve yaşam alanınızın detaylarını birlikte seçmeye davet ediyoruz.</p></div>
    <FactoryGallery/>
    <section className="wrap zenn-factory-details"><div><p className="eyebrow">ZİYARETİNİZDE</p><h2>Dokunun. İnceleyin.<br/><em>Birlikte karar verelim.</em></h2><ol className="zenn-visit-steps"><li><b>Üretimimizi tanıyın</b><p>Ürünlerin hazırlanışını ve işçilik detaylarını yerinde görün.</p></li><li><b>Kumaşları karşılaştırın</b><p>Gerçek kartelaları, dokuları ve renkleri birlikte inceleyelim.</p></li><li><b>Tasarımınızı netleştirin</b><p>Ölçü, model, üretim süresi ve teslimat detaylarını konuşalım.</p></li></ol></div><div className="address-card"><p className="eyebrow">FABRİKA ZİYARETİ</p><h2>Sizi bekliyoruz.</h2><p>Ziyaret öncesinde bizimle iletişime geçerek uygun zamanı ve tesis konumunu öğrenebilirsiniz.</p>{site.factoryAddress && <p>{site.factoryAddress}</p>}<a className="button" href={whatsappUrl("Merhaba, Zenn Bedding üretim tesisini ziyaret etmek istiyorum. Konum ve ziyaret için uygun zaman hakkında bilgi alabilir miyim?")}>Ziyaret İçin İletişime Geçin ↗</a>{site.factoryAddress && <a className="text-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.factoryAddress)}`}>Fabrika Yol Tarifi ↗</a>}<p className="form-note">Mağazamız: {site.address}</p><Link href="/magazamiz" className="text-link">Mağaza Yol Tarifi <Arrow /></Link></div></section>
  </>;
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
              Sekiz kumaş grubunu ve renk örneklerini keşfedin; gerçek kartelaları ziyaretinizde yakından inceleyin. <Link className="text-link" href="/kumas-renk-kartelasi">Kumaş & Renk Kartelası <Arrow /></Link>
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
  if (page === "biz-kimiz")
    return (
      <>
        <section className="wrap editorial-hero">
          <div>
            <p className="eyebrow">Zenn Bedding · KENDİ ÜRETİMİMİZ</p>
            <h1>
              Biz Kimiz
            </h1>
            <p>
              Zenn Bedding olarak ürünlerimizi kendi üretim tesisimizde üretiyoruz. Tasarımdan kumaş seçimine, ölçüden son dokunuşa kadar her aşamada sizinle doğrudan iletişim kuruyoruz.
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
          <p>Ölçü, kumaş, renk ve tasarım seçeneklerini birlikte değerlendirerek ihtiyacınıza uygun çözümler oluşturuyoruz. Fabrikamızı ziyaret edin, ürünleri ve kumaşları yerinde inceleyin.</p>
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
            <p className="eyebrow">Zenn Bedding MAĞAZA</p>
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
