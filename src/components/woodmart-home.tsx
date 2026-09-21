"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Photo, ProductCard } from "./shared";
import type { Product } from "@/lib/data";
const slides = [
  { title: "Sade Yaşam –", second: "Doğal Konfor.", text: "Yumuşak dokular, yalın çizgiler. Yatak odanız için zamansız bir dokunuş.", image: "/images/hero.webp", href: "/koleksiyonlar/sade-yasam", label: "Sade Yaşam koleksiyonu" },
  { title: "Modern –", second: "Yaşam Alanları.", text: "Güçlü çizgiler ve özenle seçilmiş kumaşlarla yaşam alanınıza yeni bir karakter.", image: "/images/modern.webp", href: "/koleksiyonlar/modern-konfor", label: "Modern Konfor koleksiyonu" },
  { title: "Küçük Hayaller –", second: "Büyük Konfor.", text: "Çocuk odaları için sıcak detaylar, sakin renkler ve konforlu seçenekler.", image: "/images/kids.webp", href: "/koleksiyonlar/kids-dunyasi", label: "Kids Dünyası koleksiyonu" },
];
export function HomeSlider() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const start = useRef<number | null>(null);
  const moved = useRef(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);
  return <div className="wd-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }} onDragStart={e => e.preventDefault()} onPointerDown={e => { start.current = e.clientX; moved.current = false; setPaused(true); }} onPointerMove={e => { if (start.current !== null && Math.abs(e.clientX - start.current) > 12) moved.current = true; }} onPointerUp={e => { if (start.current !== null && Math.abs(e.clientX - start.current) > 40) { const direction = e.clientX < start.current ? 1 : slides.length - 1; setIndex(i => (i + direction) % slides.length); } start.current = null; setPaused(false); }} onPointerCancel={() => { start.current = null; setPaused(false); }} onClickCapture={e => { if (moved.current) { e.preventDefault(); e.stopPropagation(); } }} role="region" aria-roledescription="slayt gösterisi" aria-label="Koleksiyonlar"><div className="wd-slide" key={index}><div className="wd-slide-copy"><p className="wd-slide-eyebrow">ZN DESIGN KOLEKSİYONU</p><h1>{slide.title}<br/>{slide.second}</h1><p>{slide.text}</p><div className="wd-slide-swatches" aria-hidden="true"><i/><i/><i/><i/></div><Link href={slide.href}>Koleksiyonu keşfet <span>&gt;</span></Link></div><Link className="wd-slide-image" href={slide.href} aria-label={slide.label}><Photo src={slide.image} alt={slide.label} priority/></Link></div><button className="wd-slide-arrow prev" aria-label="Önceki slayt" onClick={() => setIndex((index + slides.length - 1) % slides.length)}>&lt;</button><button className="wd-slide-arrow next" aria-label="Sonraki slayt" onClick={() => setIndex((index + 1) % slides.length)}>&gt;</button><div className="wd-slider-dots">{slides.map((s, i) => <button key={s.label} aria-label={`${i + 1}. slayt`} aria-pressed={index === i} onClick={() => setIndex(i)}/>)}</div></div>;
}
export function FeaturedProducts({ products }: { products: Product[] }) {
  const [active, setActive] = useState("Öne çıkanlar");
  const visible = products.filter(p => active === "Yeni ürünler" ? p.isNew : active === "Kampanyalar" ? p.campaign : true).slice(0, 8);
  return <><div className="wd-product-tabs" role="group" aria-label="Ürün seçimi">{["Öne çıkanlar", "Yeni ürünler", "Kampanyalar"].map(label => <button key={label} aria-pressed={active === label} onClick={() => setActive(label)}>{label}</button>)}</div><div aria-live="polite">{visible.length ? <ProductCarousel key={active} products={visible}/> : <div className="wd-empty"><p>Güncel kampanya seçenekleri için bizimle iletişime geçin.</p><Link href="/iletisim" className="button">BİLGİ ALIN</Link></div>}</div><div className="wd-view-all"><Link href="/urunler" className="button outline">TÜM ÜRÜNLERİ GÖR</Link></div></>;
}

function ProductCarousel({ products }: { products: Product[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const interaction = useRef({ down: false, x: 0, left: 0, moved: false, until: 0 });
  const [paused, setPaused] = useState(false);
  // Keep a full viewport of cards on both sides of the loop, even in small tabs.
  const repetitions = Math.max(1, Math.ceil(8 / products.length));
  const cards = Array.from({ length: repetitions }, () => products).flat();
  useEffect(() => {
    const el = rail.current;
    if (!el || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0, previous = 0, position = el.scrollLeft;
    const tick = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      // Native touch scrolling and keyboard scrolling can change the position
      // between animation frames. Resume from that position, preserving fractions.
      if (Math.abs(el.scrollLeft - position) > 1) position = el.scrollLeft;
      if (!interaction.current.down && now > interaction.current.until && !document.hidden) {
        position += elapsed * 0.025;
        const width = el.firstElementChild?.getBoundingClientRect().width ?? 0;
        if (!width) return;
        if (position >= width) position -= width;
        el.scrollLeft = position;
      } else position = el.scrollLeft;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);
  return <div className="wd-carousel-wrap">
    <button className="wd-motion-toggle" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? "Otomatik kaydırmayı başlat" : "Otomatik kaydırmayı durdur"}</button>
    <div ref={rail} className="wd-product-carousel" tabIndex={0} role="region" aria-label="Öne çıkan ürünler; kaydırarak keşfedin"
      onFocus={() => { interaction.current.until = Infinity; }}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) interaction.current.until = performance.now() + 2000; }}
      onPointerDown={e => { if (!e.isPrimary || e.button !== 0) return; interaction.current = { down: true, x: e.clientX, left: e.currentTarget.scrollLeft, moved: false, until: Infinity }; }}
      onPointerMove={e => { const state = interaction.current; if (!state.down) return; if (Math.abs(e.clientX - state.x) > 8) { state.moved = true; if (e.pointerType !== "touch") { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.scrollLeft = state.left + state.x - e.clientX; } } }}
      onPointerUp={() => { interaction.current.down = false; interaction.current.until = performance.now() + 2500; }}
      onPointerCancel={() => { interaction.current.down = false; interaction.current.until = performance.now() + 2500; }}
      onLostPointerCapture={() => { interaction.current.down = false; interaction.current.until = performance.now() + 2500; }}
      onPointerLeave={e => { if (interaction.current.down && !e.currentTarget.hasPointerCapture(e.pointerId)) { interaction.current.down = false; interaction.current.until = performance.now() + 2500; } }}
      onTouchEnd={() => { interaction.current.until = performance.now() + 2500; }}
      onWheel={() => { interaction.current.until = performance.now() + 2500; }}
      onDragStart={e => e.preventDefault()}
      onClickCapture={e => { if (interaction.current.moved) { e.preventDefault(); e.stopPropagation(); } }}>
      {[0, 1].map(copy => <div className="wd-product-group" key={copy}>{cards.map((p, i) => <ProductCard product={p} key={`${p.slug}-${i}`}/>)}</div>)}
    </div>
  </div>;
}

const references = ["Liva Home", "Mira Suites", "Nora Living", "Vela Hotel", "Dora Interiors", "Aden Residence"];
export function References() {
  const [paused, setPaused] = useState(false);
  return <section className="wrap wd-section wd-references" aria-label="Referanslar">
    <div className="wd-section-heading"><p>BİRLİKTE DEĞER ÜRETİYORUZ</p><h2>REFERANSLARIMIZ</h2><p>Örnek referans isimleridir.</p></div>
    <button className="wd-motion-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Kaydırmayı başlat" : "Kaydırmayı durdur"}</button>
    <div className="wd-reference-window"><div className="wd-reference-track" style={{ animationPlayState: paused ? "paused" : "running" }}>{[0, 1].map(copy => <div className="wd-reference-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>{references.map(name => <span key={name}>{name}</span>)}</div>)}</div></div>
  </section>;
}
