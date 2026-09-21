"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Brand, Arrow } from "./shared";
import { categories, site } from "@/lib/data";
import { whatsappUrl } from "@/lib/contact";
const links = [
  ["/", "Ana Sayfa"],
  ["/urunler", "Ürünler"],
  ["/koleksiyonlar", "Koleksiyonlar"],
  ["/ozel-uretim", "Özel Üretim"],
  ["/hakkimizda", "Hakkımızda"],
  ["/iletisim", "İletişim"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const path = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header className={`wd-header ${path === "/" ? "wd-home-header" : ""}`}>
      <div className="wd-topbar"><div className="wrap"><span>TÜRKÇE <span aria-hidden="true">⌄</span> <b> TÜRKİYE</b></span><span>YAŞAM ALANINIZA TASARIM, UYKUNUZA KONFOR</span><div><Link href="/magazamiz">MAĞAZAMIZ</Link><Link href="/iletisim">İLETİŞİM</Link><Link href="/hakkimizda">HAKKIMIZDA</Link></div></div></div>
      <div className="wrap wd-main-header">
        <button ref={toggle} className="menu-toggle" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button>
        <Link href="/" aria-label="ZN Design ana sayfa"><Brand /></Link>
        <form action="/urunler" className="wd-search" role="search"><input name="q" type="search" aria-label="Ürünlerde ara" placeholder="Ürünlerde ara..."/><select name="kategori" aria-label="Arama kategorisi"><option value="">TÜM KATEGORİLER</option>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select><button aria-label="Ara" type="submit"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg></button></form>
        <div className="wd-header-actions"><Link href="/magazamiz">MAĞAZAMIZ</Link><Link href="/iletisim" aria-label="Bilgi ve fiyat alın"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 11a8 8 0 0 1-8 8H4l-2 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/></svg><span>Bilgi & Fiyat</span></Link></div>
      </div>
      <div className="wd-nav-border"><div className="wrap wd-nav-row">
        <div className="wd-category-menu"><button onClick={() => setCategoryOpen(!categoryOpen)} aria-expanded={categoryOpen} aria-controls="header-categories"><span>☰</span> TÜM KATEGORİLER <span>⌄</span></button>{categoryOpen && <div id="header-categories" onKeyDown={e => {if(e.key === "Escape") setCategoryOpen(false);}}>{categories.map(c => <Link key={c.slug} href={`/urunler?kategori=${c.slug}`} onClick={() => setCategoryOpen(false)}>{c.name}<span>&gt;</span></Link>)}</div>}</div>
        <nav id="navigation" aria-label="Ana menü" className={open ? "wd-navigation open" : "wd-navigation"} onKeyDown={e => {if(e.key === "Escape") {setOpen(false);toggle.current?.focus();}}}>{links.map(([url,label]) => <Link key={url} href={url} aria-current={path === url ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}</nav>
        <Link className="wd-offers" href="/urunler?kampanya=1">ÖZEL FIRSATLAR</Link>
      </div></div>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <Link href="/">
            <Brand />
          </Link>
          <p>
            Konforun tasarımla
            <br />
            buluştuğu yer.
          </p>
          <small>ZN Design | Uyku & Yaşam</small>
        </div>
        <div>
          <h3>KOLEKSİYONU KEŞFEDİN</h3>
          {categories.map((c) => (
            <Link key={c.slug} href={`/urunler?kategori=${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
        <div>
          <h3>ZN DESIGN</h3>
          {links.slice(2).map(([url, label]) => (
            <Link href={url} key={url}>
              {label}
            </Link>
          ))}
          <Link href="/magazamiz">Mağazamız</Link>
        </div>
        <div>
          <h3>BİZİ ZİYARET EDİN</h3>
          <p>{site.address}</p>
          {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
          <Link href="/iletisim" className="text-link">
            Birlikte konuşalım <Arrow />
          </Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} ZN Design. Tüm hakları saklıdır.
        </span>
        <span>Ürün ve koleksiyonlar örnektir. Görseller temsilidir.</span>
      </div>
    </footer>
  );
}
export function FloatingContact() {
  const path = usePathname();
  const [reminder, setReminder] = useState(-1);
  useEffect(() => {
    const timer = window.setInterval(() => setReminder(i => i + 1), 5000);
    return () => window.clearInterval(timer);
  }, []);
  const messages = ["Sana nasıl yardımcı olabilirim?", "Bir sorun varsa bana tıkla.", "Ölçü ve kumaşlar hakkında konuşalım mı?"];

  return (
    <a
      className={`floating-contact ${/^\/urunler\/.+/.test(path) ? "on-product" : ""}`}
      href={whatsappUrl(
        "Merhaba, ZN Design ürünleri hakkında bilgi almak istiyorum.",
      )}
      aria-label="WhatsApp üzerinden bilgi alın"
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M20 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.2-4.2A8.5 8.5 0 1 1 20 11.5Z" />
        <path d="M8 7c0 5 4 8 7 8l1-2-3-1-1 1-2-2 1-1-1-3Z" />
      </svg>
      <span>Birlikte konuşalım</span>{reminder >= 0 && <span key={reminder} className="wd-whatsapp-reminder">{messages[reminder % messages.length]}</span>}
    </a>
  );
}

export function ScrollReveal() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll("main > section:not(.hero), main .section-head")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [path]);
  return null;
}
