import Link from "next/link";
import { Photo } from "@/components/shared";
import { HomeSlider, FeaturedProducts, References } from "@/components/woodmart-home";
import { categories, collections, site } from "@/lib/data";
import { getProducts } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { ...(site.domain ? { alternates: { canonical: site.domain.replace(/\/$/, "") } } : {}) };
export default async function Home() {
  const products = await getProducts();
  return <>
    <section className="wd-hero-area"><div className="wrap wd-hero-layout"><aside className="wd-sidebar" aria-label="Ürün kategorileri">
      {categories.map((c, i) => <Link key={c.slug} href={`/urunler?kategori=${c.slug}`}><span className="wd-category-icon" aria-hidden="true">{["▱", "▤", "▥", "▰", "▧", "☆"][i]}</span>{c.name}<span className="wd-chevron">&gt;</span></Link>)}
      {[ ["/koleksiyonlar", "◇", "Koleksiyonlar"], ["/ozel-uretim", "✂", "Özel Üretim"], ["/urunler?yeni=1", "✧", "Yeni Ürünler"], ["/urunler?kampanya=1", "%", "Kampanyalar"] ].map(([href, icon, label]) => <Link href={href} key={href}><span className="wd-category-icon">{icon}</span>{label}<span className="wd-chevron">&gt;</span></Link>)}
    </aside><HomeSlider/></div></section>
    <section className="wrap wd-section" id="kategoriler"><div className="wd-section-heading"><p>ZN DESIGN KOLEKSİYONLARI</p><h2>ÖNE ÇIKAN KATEGORİLER</h2><p>Yaşam alanınız için tasarlanan konforlu ve zamansız seçenekler.</p></div><div className="wd-category-list">{categories.map(c => <Link href={`/urunler?kategori=${c.slug}`} key={c.slug}>{c.name}</Link>)}</div></section>
    <section className="wrap wd-section wd-featured"><div className="wd-section-heading"><p>ZN DESIGN UYKU & YAŞAM</p><h2>ÖNE ÇIKAN ÜRÜNLER</h2><p>Yatak odanıza yeni bir dokunuş katacak modellerimizi keşfedin.</p></div><FeaturedProducts products={products}/></section>
    <section className="wd-spotlight"><div className="wrap"><div className="wd-spotlight-image"><Photo src="/images/modern.webp" alt="Modern Konfor yatak odası koleksiyonu"/></div><div className="wd-spotlight-copy"><p>KOLEKSİYONU YAKINDAN TANIYIN</p><h2>Modern Konfor –<br/>Zamansız Tasarım.</h2><div className="wd-specs"><div><b>TASARIM</b><span>ZN Design</span></div><div><b>DOKULAR</b><span>Keten, bukle, kadife</span></div><div><b>SEÇENEKLER</b><span>Size özel ölçüler</span></div></div><Link href="/koleksiyonlar/modern-konfor" className="button outline">KOLEKSİYONU İNCELE</Link></div></div></section>
    <section className="wrap wd-about"><div><p>YAŞAM ALANINIZ İÇİN HER DETAY</p><h2>ZN Design – Uyku & Yaşam</h2><p>Konfor, özenli işçilik ve zamansız tasarımı bir araya getiriyoruz. Baza, başlık ve yatak koleksiyonlarımızla yaşam alanınıza uygun modeli keşfedin.</p><div className="wd-about-actions"><Link href="/hakkimizda" className="button">BİZİ TANIYIN</Link><Link href="/iletisim" className="button outline">İLETİŞİME GEÇİN</Link></div></div><Photo src="/images/headboard.webp" alt="ZN Design döşemeli başlık detayları"/></section>
    <section className="wd-contact-banner"><p>ÖLÇÜ, RENK VE KUMAŞ SEÇENEKLERİ</p><h2>SİZE ÖZEL BİR TASARIM</h2><p>Hayalinizdeki yatak odasını birlikte şekillendirelim.</p><Link href="/ozel-uretim" className="button">ÖZEL ÜRETİMİ KEŞFEDİN</Link></section>
    <section className="wrap wd-section"><div className="wd-section-heading"><p>YAŞAM ALANINIZA İLHAM</p><h2>KOLEKSİYONLARIMIZ</h2><p>Farklı tarzlar, doğal dokular ve size ait bir dünya.</p></div><div className="wd-editorial-grid">{collections.map(c => <article key={c.slug}><Link href={`/koleksiyonlar/${c.slug}`}><Photo src={c.image} alt={c.name}/><span className="wd-editorial-label">ZN DESIGN KOLEKSİYONU</span><h3>{c.name}</h3></Link><p>{c.description}</p><Link className="wd-read-more" href={`/koleksiyonlar/${c.slug}`}>KOLEKSİYONU KEŞFET</Link></article>)}</div></section>
    <References/><section className="wd-service-strip wrap"><div><span>◇</span><h3>Özenli tasarım</h3><p>Her detayda konfor</p></div><div><span>▱</span><h3>Zengin koleksiyon</h3><p>Yaşamınıza uygun seçenekler</p></div><div><span>✂</span><h3>Özel üretim</h3><p>Size özel ölçü ve kumaşlar</p></div><div><span>⌂</span><h3>Mağazamızı ziyaret edin</h3><Link href="/magazamiz">Esenyurt / İstanbul &gt;</Link></div></section>
  </>;
}
