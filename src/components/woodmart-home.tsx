"use client";
import { useState } from "react";
import Link from "next/link";
import { Photo, ProductGrid } from "./shared";
import type { Product } from "@/lib/data";
const slides = [
  { title: "Sade Yaşam –", second: "Doğal Konfor.", text: "Yumuşak dokular, yalın çizgiler. Yatak odanız için zamansız bir dokunuş.", image: "/images/hero.webp", href: "/koleksiyonlar/sade-yasam", label: "Sade Yaşam koleksiyonu" },
  { title: "Modern –", second: "Yaşam Alanları.", text: "Güçlü çizgiler ve özenle seçilmiş kumaşlarla yaşam alanınıza yeni bir karakter.", image: "/images/modern.webp", href: "/koleksiyonlar/modern-konfor", label: "Modern Konfor koleksiyonu" },
  { title: "Küçük Hayaller –", second: "Büyük Konfor.", text: "Çocuk odaları için sıcak detaylar, sakin renkler ve konforlu seçenekler.", image: "/images/kids.webp", href: "/koleksiyonlar/kids-dunyasi", label: "Kids Dünyası koleksiyonu" },
];
export function HomeSlider() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return <div className="wd-slider" role="region" aria-roledescription="slayt gösterisi" aria-label="Koleksiyonlar"><div className="wd-slide" key={index}><div className="wd-slide-copy"><p className="wd-slide-eyebrow">ZN DESIGN KOLEKSİYONU</p><h1>{slide.title}<br/>{slide.second}</h1><p>{slide.text}</p><div className="wd-slide-swatches" aria-hidden="true"><i/><i/><i/><i/></div><Link href={slide.href}>Koleksiyonu keşfet <span>→</span></Link></div><Link className="wd-slide-image" href={slide.href} aria-label={slide.label}><Photo src={slide.image} alt={slide.label} priority/></Link></div><button className="wd-slide-arrow prev" aria-label="Önceki slayt" onClick={() => setIndex((index + slides.length - 1) % slides.length)}>‹</button><button className="wd-slide-arrow next" aria-label="Sonraki slayt" onClick={() => setIndex((index + 1) % slides.length)}>›</button><div className="wd-slider-dots">{slides.map((s, i) => <button key={s.label} aria-label={`${i + 1}. slayt`} aria-pressed={index === i} onClick={() => setIndex(i)}/>)}</div></div>;
}
export function FeaturedProducts({ products }: { products: Product[] }) {
  const [active, setActive] = useState("Öne çıkanlar");
  const visible = products.filter(p => active === "Yeni ürünler" ? p.isNew : active === "Kampanyalar" ? p.campaign : true).slice(0, 8);
  return <><div className="wd-product-tabs" role="group" aria-label="Ürün seçimi">{["Öne çıkanlar", "Yeni ürünler", "Kampanyalar"].map(label => <button key={label} aria-pressed={active === label} onClick={() => setActive(label)}>{label}</button>)}</div><div aria-live="polite">{visible.length ? <ProductGrid items={visible}/> : <div className="wd-empty"><p>Güncel kampanya seçenekleri için bizimle iletişime geçin.</p><Link href="/iletisim" className="button">BİLGİ ALIN</Link></div>}</div><div className="wd-view-all"><Link href="/urunler" className="button outline">TÜM ÜRÜNLERİ GÖR</Link></div></>;
}
