"use client";
import { useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import { Photo } from "./shared";
import { SiteIcon } from "./site-icon";

export function CompanyGallery({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState<"factory" | "delivery">("factory");
  const visible = items.filter(item => item.category === category);
  return <section className="company-gallery" aria-labelledby="company-gallery-title" id="uretim-ve-teslimatlar"><div className="wrap">
    <div className="wd-section-heading"><p>ÜRETİMDEN YAŞAM ALANINIZA</p><h2 id="company-gallery-title">Fabrikamızdan ve Teslimatlarımızdan</h2><p>İşçiliğimizi, üretim sürecimizi ve yerini bulan tasarımlarımızı yakından tanıyın.</p></div>
    <div className="company-gallery-filters" role="group" aria-label="Fotoğraf kategorisi">{([['factory', 'Fabrikamız', 'factory'], ['delivery', 'Teslimatlarımız', 'truck']] as const).map(([value, label, icon]) => <button key={value} aria-pressed={category === value} aria-controls="company-gallery-results" onClick={() => setCategory(value)}><SiteIcon name={icon} />{label}</button>)}</div>
    <div id="company-gallery-results" aria-live="polite" aria-atomic="true">
      {visible.length ? <div className="company-gallery-grid">{visible.map(item => <figure key={item.id}><Photo src={item.src} alt={item.caption} /><figcaption>{item.caption}</figcaption></figure>)}</div> : <div className="company-gallery-empty"><SiteIcon name={category === "factory" ? "factory" : "truck"} width={42} height={42} /><h3>{category === "factory" ? "Üretimden kareler" : "Yerini bulan tasarımlar"}</h3><p>{category === "factory" ? "Fabrikamızdan fotoğraflar yakında burada." : "Tamamlanan teslimatlarımızdan fotoğraflar yakında burada."}</p></div>}
    </div>
  </div></section>;
}
