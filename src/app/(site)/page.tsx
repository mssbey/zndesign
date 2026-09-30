import Link from "next/link";
import { SiteIcon, categoryIcons, type IconName } from "@/components/site-icon";
import { Photo } from "@/components/shared";
import { HomeSlider, FeaturedProducts, References } from "@/components/woodmart-home";
import { site } from "@/lib/data";
import { getCategories, getCollections } from "@/lib/taxonomy";
import { CategoryCards } from "@/components/category-cards";
import { FactoryGallery } from "@/components/factory-gallery";
import { whatsappUrl } from "@/lib/contact";
import { getProducts } from "@/lib/db";
import { defaultSlides, getSlides } from "@/lib/slides";
export const dynamic = "force-dynamic";
export const metadata = { ...(site.domain ? { alternates: { canonical: site.domain.replace(/\/$/, "") } } : {}) };
export default async function Home() {
  const [products, categories, collections, slides] = await Promise.all([getProducts(), getCategories(), getCollections(), getSlides().catch(() => defaultSlides)]);
  return <>
    <section className="wd-hero-area"><div className="wrap wd-hero-layout"><aside className="wd-sidebar" aria-label="Ürün kategorileri">
      {categories.map(c => <Link key={c.slug} href={`/urunler?kategori=${c.slug}`}><span className="wd-category-icon"><SiteIcon name={categoryIcons[c.slug] ?? "grid"} /></span>{c.name}<SiteIcon name="chevron" className="wd-chevron" width={14} height={14} /></Link>)}
      {[ ["/koleksiyonlar", "layers", "Koleksiyonlar"], ["/ozel-uretim", "ruler", "Özel Üretim"], ["/kumas-renk-kartelasi", "fabric", "Kumaş & Renk Kartelası"], ["/urunler?yeni=1", "sparkle", "Yeni Ürünler"], ["/urunler?kampanya=1", "tag", "Kampanyalar"] ].map(([href, icon, label]) => <Link href={href} key={href}><span className="wd-category-icon"><SiteIcon name={icon as IconName} /></span>{label}<SiteIcon name="chevron" className="wd-chevron" width={14} height={14} /></Link>)}
    </aside><HomeSlider slides={slides}/></div></section>
    <CategoryCards />
    <section className="wrap wd-section wd-featured"><div className="wd-section-heading"><p>Zenn Bedding UYKU & YAŞAM</p><h2>ÖNE ÇIKAN ÜRÜNLER</h2><p>Yatak odanıza yeni bir dokunuş katacak modellerimizi keşfedin.</p></div><FeaturedProducts products={products}/></section>
    <section className="wd-spotlight"><div className="wrap"><div className="wd-spotlight-image"><Photo src="/images/modern.webp" alt="Modern Konfor yatak odası koleksiyonu"/></div><div className="wd-spotlight-copy"><p>KOLEKSİYONU YAKINDAN TANIYIN</p><h2>Modern Konfor –<br/>Zamansız Tasarım.</h2><div className="wd-specs"><div><b>TASARIM</b><span>Zenn Bedding</span></div><div><b>DOKULAR</b><span>Keten, bukle, kadife</span></div><div><b>SEÇENEKLER</b><span>Size özel ölçüler</span></div></div><Link href="/koleksiyonlar/modern-koleksiyon" className="button outline">KOLEKSİYONU İNCELE</Link></div></div></section>
    <section className="wrap wd-about"><div><p>YAŞAM ALANINIZ İÇİN HER DETAY</p><h2>Zenn Bedding – Uyku & Yaşam</h2><p>Konfor, özenli işçilik ve zamansız tasarımı bir araya getiriyoruz. Baza, başlık ve yataklarımızı kendi tesisimizde üretiyor; ölçü, kumaş ve renk seçeneklerini sizinle birlikte belirliyoruz.</p><div className="wd-about-actions"><Link href="/biz-kimiz" className="button">BİZ KİMİZ</Link><Link href="/iletisim" className="button outline">İLETİŞİME GEÇİN</Link></div></div><Photo src="/images/headboard.webp" alt="Zenn Bedding döşemeli başlık detayları"/></section>
    <section className="wd-contact-banner"><p>ÖLÇÜ, RENK VE KUMAŞ SEÇENEKLERİ</p><h2>SİZE ÖZEL BİR TASARIM</h2><p>Hayalinizdeki yatak odasını birlikte şekillendirelim.</p><div className="actions"><Link href="/ozel-uretim" className="button">ÖZEL ÜRETİMİ KEŞFEDİN</Link><Link href="/kumas-renk-kartelasi" className="button outline">KUMAŞ & RENK KARTELASI</Link></div></section>
    <section className="wrap wd-section"><div className="wd-section-heading"><p>YAŞAM ALANINIZA İLHAM</p><h2>KOLEKSİYONLARIMIZ</h2><p>Farklı tarzlar, doğal dokular ve size ait bir dünya.</p></div><div className="wd-collection-list">{collections.map(c => <Link className="wd-collection-row" href={`/koleksiyonlar/${c.slug}`} key={c.slug}><Photo src={c.image} alt={c.name}/><div><h3>{c.name}</h3><p>{c.description}</p></div><span className="wd-read-more">KOLEKSİYONU KEŞFET <span aria-hidden="true">&gt;</span></span></Link>)}</div></section>
    <section className="wd-contact-banner wd-factory-invite"><p>DOĞRUDAN ÜRETİCİNİZLE TANIŞIN</p><h2>Üretimi Yerinde Görün, Birlikte Tasarlayalım.</h2><p>Zenn Bedding olarak ürünlerimizi kendi üretim tesisimizde üretiyoruz. Ölçü, kumaş, renk ve tasarım seçeneklerini birlikte değerlendirerek ihtiyacınıza uygun çözümler oluşturuyoruz. Fabrikamızı ziyaret edin, ürünleri ve kumaşları yerinde inceleyin.</p><div className="actions"><Link href="/fabrikamiz" className="button">Fabrikamızı Ziyaret Edin</Link><a className="button outline" href={whatsappUrl("Merhaba, fabrikanızı ziyaret edip ürün ve kumaş seçeneklerini incelemek istiyorum.")}>WhatsApp’tan İletişime Geçin</a></div><FactoryGallery/></section>
    <References/><section className="wd-service-strip wrap"><div><span><SiteIcon name="sparkle" width={30} height={30}/></span><h3>Özenli tasarım</h3><p>Her detayda konfor</p></div><div><span><SiteIcon name="layers" width={30} height={30}/></span><h3>Zengin koleksiyon</h3><p>Yaşamınıza uygun seçenekler</p></div><div><span><SiteIcon name="ruler" width={30} height={30}/></span><h3>Özel üretim</h3><p>Size özel ölçü ve kumaşlar</p></div><div><span><SiteIcon name="factory" width={30} height={30}/></span><h3>Mağazamızı ziyaret edin</h3><Link href="/magazamiz">Esenyurt / İstanbul &gt;</Link></div></section>
  </>;
}
