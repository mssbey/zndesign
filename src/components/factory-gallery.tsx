import Link from "next/link";
import { site } from "@/lib/data";
import { Lines, Photo } from "./shared";
import { SiteIcon } from "./site-icon";
import { getGallery } from "@/lib/gallery";
import { whatsappUrl } from "@/lib/contact";
import type { ContentValues } from "@/lib/content-sections";

// Only owner-supplied photography is shown as the factory. Never substitute stock imagery.
async function getFactoryImages() {
  const items = (await getGallery()).filter(item => item.category === "factory");
  return [...items, ...site.factoryImages.filter(src => !items.some(item => item.src === src)).map((src, i) => ({ src, caption: `Zenn Bedding üretim tesisinden görünüm ${i + 1}` }))];
}

export async function FactoryGallery() {
  const images = await getFactoryImages();
  if (!images.length) return null;
  return <div className="wrap factory-gallery">{images.map(item => <figure key={item.src}><Photo src={item.src} alt={item.caption}/><figcaption>{item.caption}</figcaption></figure>)}</div>;
}

/** Home page invitation: the first factory photo, framed, beside the copy. */
export async function FactoryInvite({ content: c }: { content: ContentValues }) {
  const [main, ...rest] = await getFactoryImages();
  const thumbs = rest.slice(0, 3);
  const points = [c.point1, c.point2, c.point3].filter(Boolean);
  return <section className={`wd-factory-split${main ? "" : " no-media"}`} aria-labelledby="factory-invite-title"><div className="wrap">
    {main && <div className="wd-factory-media">
      <figure><Photo src={main.src} alt={main.caption}/>{c.badge && <figcaption className="wd-factory-badge"><SiteIcon name="factory" width={22} height={22}/><span>{c.badge}</span></figcaption>}</figure>
      {thumbs.length > 0 && <div className="wd-factory-thumbs">{thumbs.map(item => <Photo key={item.src} src={item.src} alt={item.caption}/>)}</div>}
    </div>}
    <div className="wd-factory-copy">
      <p className="wd-factory-eyebrow">{c.eyebrow}</p>
      <h2 id="factory-invite-title">{c.title}</h2>
      <p><Lines text={c.text}/></p>
      {points.length > 0 && <ul>{points.map((point, i) => <li key={i}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{point}</li>)}</ul>}
      <div className="wd-factory-actions">{c.buttonText && <Link href={c.buttonHref || "/fabrikamiz"} className="button">{c.buttonText}</Link>}{c.whatsappText && <a className="button outline" href={whatsappUrl(c.whatsappMessage)}>{c.whatsappText}</a>}</div>
    </div>
  </div></section>;
}
