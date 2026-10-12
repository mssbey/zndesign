import Link from "next/link";
import { SiteIcon, categoryIcons, type IconName } from "@/components/site-icon";
import { Lines, Photo } from "@/components/shared";
import { HomeSlider, FeaturedProducts, References } from "@/components/woodmart-home";
import { site } from "@/lib/data";
import { getCategories, getCollections } from "@/lib/taxonomy";
import { CategoryCards } from "@/components/category-cards";
import { FactoryInvite } from "@/components/factory-gallery";
import { getProducts } from "@/lib/db";
import { defaultSlides, getSlides } from "@/lib/slides";
import { getContents } from "@/lib/content";
import { sectionsFor } from "@/lib/content-sections";
export const dynamic = "force-dynamic";
export const metadata = { ...(site.domain ? { alternates: { canonical: site.domain.replace(/\/$/, "") } } : {}) };
export default async function Home() {
  const [products, categories, collections, slides, content] = await Promise.all([getProducts(), getCategories(), getCollections(), getSlides().catch(() => defaultSlides), getContents(sectionsFor("home").map(s => s.id))]);
  const { "home-categories": cats, "home-featured": featured, "home-spotlight": spot, "home-about": about, "home-custom-banner": banner, "home-collections": coll, "home-factory": factory, "home-references": refs, "home-services": services } = content;
  const specs = [1, 2, 3].map(n => [spot[`spec${n}Label`], spot[`spec${n}Value`]]).filter(([label, value]) => label || value);
  return <>
    <section className="wd-hero-area"><div className="wrap wd-hero-layout"><aside className="wd-sidebar" aria-label="Ürün kategorileri">
      {categories.map(c => <Link key={c.slug} href={`/urunler?kategori=${c.slug}`}><span className="wd-category-icon"><SiteIcon name={categoryIcons[c.slug] ?? "grid"} /></span>{c.name}<SiteIcon name="chevron" className="wd-chevron" width={14} height={14} /></Link>)}
      {[ ["/koleksiyonlar", "layers", "Koleksiyonlar"], ["/ozel-uretim", "ruler", "Özel Üretim"], ["/kumas-renk-kartelasi", "fabric", "Kumaş & Renk Kartelası"], ["/urunler?yeni=1", "sparkle", "Yeni Ürünler"], ["/urunler?kampanya=1", "tag", "Kampanyalar"] ].map(([href, icon, label]) => <Link href={href} key={href}><span className="wd-category-icon"><SiteIcon name={icon as IconName} /></span>{label}<SiteIcon name="chevron" className="wd-chevron" width={14} height={14} /></Link>)}
    </aside><HomeSlider slides={slides}/></div></section>
    <CategoryCards eyebrow={cats.eyebrow} title={cats.title} text={cats.text} />
    <section className="wrap wd-section wd-featured"><div className="wd-section-heading"><p>{featured.eyebrow}</p><h2>{featured.title}</h2>{featured.text && <p>{featured.text}</p>}</div><FeaturedProducts products={products}/></section>
    <section className="wd-spotlight"><div className="wrap"><div className="wd-spotlight-image"><Photo src={spot.image} alt={spot.imageAlt}/></div><div className="wd-spotlight-copy"><p>{spot.eyebrow}</p><h2><Lines text={spot.title}/></h2>{specs.length > 0 && <div className="wd-specs">{specs.map(([label, value], i) => <div key={i}><b>{label}</b><span>{value}</span></div>)}</div>}{spot.buttonText && <Link href={spot.buttonHref || "/"} className="button outline">{spot.buttonText}</Link>}</div></div></section>
    <section className="wrap wd-about"><div><p>{about.eyebrow}</p><h2>{about.title}</h2><p><Lines text={about.text}/></p><div className="wd-about-actions">{about.button1Text && <Link href={about.button1Href || "/"} className="button">{about.button1Text}</Link>}{about.button2Text && <Link href={about.button2Href || "/"} className="button outline">{about.button2Text}</Link>}</div></div><Photo src={about.image} alt={about.imageAlt}/></section>
    <section className="wd-contact-banner"><p>{banner.eyebrow}</p><h2>{banner.title}</h2><p><Lines text={banner.text}/></p><div className="actions">{banner.button1Text && <Link href={banner.button1Href || "/"} className="button">{banner.button1Text}</Link>}{banner.button2Text && <Link href={banner.button2Href || "/"} className="button outline">{banner.button2Text}</Link>}</div></section>
    <section className="wrap wd-section"><div className="wd-section-heading"><p>{coll.eyebrow}</p><h2>{coll.title}</h2>{coll.text && <p>{coll.text}</p>}</div><div className="wd-collection-list">{collections.map(c => <Link className="wd-collection-row" href={`/koleksiyonlar/${c.slug}`} key={c.slug}><Photo src={c.image} alt={c.name}/><div><h3>{c.name}</h3><p>{c.description}</p></div><span className="wd-read-more">KOLEKSİYONU KEŞFET <span aria-hidden="true">&gt;</span></span></Link>)}</div></section>
    <FactoryInvite content={factory}/>
    <References eyebrow={refs.eyebrow} title={refs.title} note={refs.note} names={refs.names}/><section className="wd-service-strip wrap"><div><span><SiteIcon name="sparkle" width={30} height={30}/></span><h3>{services.s1Title}</h3><p>{services.s1Text}</p></div><div><span><SiteIcon name="layers" width={30} height={30}/></span><h3>{services.s2Title}</h3><p>{services.s2Text}</p></div><div><span><SiteIcon name="ruler" width={30} height={30}/></span><h3>{services.s3Title}</h3><p>{services.s3Text}</p></div><div><span><SiteIcon name="factory" width={30} height={30}/></span><h3>{services.s4Title}</h3><Link href={services.s4Href || "/magazamiz"}>{services.s4Text}</Link></div></section>
  </>;
}
