"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Brand, Arrow } from "./shared";
import { categories, collections, site } from "@/lib/data";
import { whatsappUrl } from "@/lib/contact";

const links = [["/ozel-uretim", "Özel Üretim"], ["/kumas-renk-kartelasi", "Kumaş & Renk"], ["/biz-kimiz", "Biz Kimiz"], ["/iletisim", "İletişim"]];

function MenuChevron() {
  return <svg className="nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const path = usePathname();
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const productToggle = useRef<HTMLButtonElement>(null);
  const collectionToggle = useRef<HTMLButtonElement>(null);
  const allToggle = useRef<HTMLButtonElement>(null);
  function close() { setOpen(false); setExpanded(null); }
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) { setExpanded(null); setOpen(false); }
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <header className={`wd-header ${path === "/" ? "wd-home-header" : ""}`} ref={header} onKeyDown={event => {
    if (event.key === "Escape") {
      if (expanded) { (expanded === "products" ? productToggle : expanded === "collections" ? collectionToggle : allToggle).current?.focus(); setExpanded(null); }
      else { setOpen(false); toggle.current?.focus(); }
    }
  }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <div className="wd-topbar"><div className="wrap"><span>TÜRKÇE <MenuChevron /> <b> TÜRKİYE</b></span><span>YAŞAM ALANINIZA TASARIM, UYKUNUZA KONFOR</span><div><Link href="/magazamiz">MAĞAZAMIZ</Link><Link href="/iletisim">İLETİŞİM</Link><Link href="/biz-kimiz">BİZ KİMİZ</Link></div></div></div>
    <div className="wrap wd-main-header">
      <button ref={toggle} className="menu-toggle" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} aria-controls="navigation" onClick={() => { setOpen(!open); setExpanded(null); }}>{open ? "✕" : "☰"}</button>
      <Link href="/" aria-label="Zenn Bedding ana sayfa" onClick={close}><Brand /></Link>
      <form action="/urunler" className="wd-search" role="search"><input name="q" type="search" aria-label="Ürünlerde ara" placeholder="Ürünlerde ara..."/><select name="kategori" aria-label="Arama kategorisi"><option value="">TÜM KATEGORİLER</option>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select><button aria-label="Ara" type="submit"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg></button></form>
      <div className="wd-header-actions"><Link href="/magazamiz">MAĞAZAMIZ</Link><Link href="/iletisim" aria-label="Bilgi ve fiyat alın"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 11a8 8 0 0 1-8 8H4l-2 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/></svg><span>Bilgi & Fiyat</span></Link></div>
    </div>
    <div className="wd-nav-border"><div className="wrap wd-nav-row">
      <div className="wd-category-menu"><button ref={allToggle} aria-expanded={expanded === "all"} aria-controls="header-categories" onClick={() => setExpanded(expanded === "all" ? null : "all")}><span>☰</span> TÜM KATEGORİLER <MenuChevron /></button><div id="header-categories" hidden={expanded !== "all"}>{categories.map(c => <Link href={`/urunler?kategori=${c.slug}`} key={c.slug} onClick={close}>{c.name}<span>&gt;</span></Link>)}</div></div>
      <nav id="navigation" aria-label="Ana menü" className={`wd-navigation ${open ? "open" : ""}`}>
        <Link href="/" aria-current={path === "/" ? "page" : undefined} onClick={close}>Ana Sayfa</Link>
        <Link href="/biz-kimiz" aria-current={path === "/biz-kimiz" ? "page" : undefined} onClick={close}>Biz Kimiz</Link>
        {[
          { id: "products", label: "Ürünler", href: "/urunler", ref: productToggle, items: categories.map(c => ({ name: c.name, href: `/urunler?kategori=${c.slug}` })) },
          { id: "collections", label: "Koleksiyonlar", href: "/koleksiyonlar", ref: collectionToggle, items: collections.map(c => ({ name: c.name, href: `/koleksiyonlar/${c.slug}` })) },
        ].map(group => <div className="zenn-nav-group" key={group.id}>
          <button ref={group.ref} className={path.startsWith(group.href) ? "is-active" : ""} aria-expanded={expanded === group.id} aria-controls={`nav-${group.id}`} onClick={() => setExpanded(expanded === group.id ? null : group.id)}>{group.label}<MenuChevron /></button>
          <div className="zenn-submenu" id={`nav-${group.id}`} hidden={expanded !== group.id}>
            {group.items.map(item => <Link key={item.href} href={item.href} onClick={close}>{item.name}<span aria-hidden="true">↗</span></Link>)}
            <Link className="submenu-all" href={group.href} onClick={close}>Tüm {group.label.toLocaleLowerCase("tr")} <Arrow /></Link>
          </div>
        </div>)}
        {links.filter(([href]) => href !== "/biz-kimiz").map(([href, label]) => <Link href={href} key={href} aria-current={path === href ? "page" : undefined} onClick={close}>{label}</Link>)}
      </nav>
      <Link className="wd-offers" href="/urunler?kampanya=1" onClick={close}>ÖZEL FIRSATLAR</Link>
    </div></div>
  </header>;
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
          <small>Zenn Bedding | Uyku & Yaşam</small>
        </div>
        <div>
          <h3>ÜRÜNLERİ KEŞFEDİN</h3>
          {categories.map((c) => (
            <Link key={c.slug} href={`/urunler?kategori=${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
        <div>
          <h3>Zenn Bedding</h3>
          {links.map(([url, label]) => (
            <Link href={url} key={url}>
              {label}
            </Link>
          ))}
          <Link href="/koleksiyonlar">Koleksiyonlar</Link><Link href="/magazamiz">Mağazamız</Link><Link href="/fabrikamiz">Fabrikamız</Link>
        </div>
        <div>
          <h3>BİZİ ZİYARET EDİN</h3>
          <p>{site.address}</p>
          {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}<a href={whatsappUrl("Merhaba, Zenn Bedding ürünleri hakkında bilgi almak istiyorum.")}>WhatsApp’tan İletişime Geçin</a>
          <Link href="/iletisim" className="text-link">
            Birlikte konuşalım <Arrow />
          </Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} Zenn Bedding. Tüm hakları saklıdır.
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
        "Merhaba, Zenn Bedding ürünleri hakkında bilgi almak istiyorum.",
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
