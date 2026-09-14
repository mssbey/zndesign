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
  const [compact, setCompact] = useState(false);
  const path = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const f = () => setCompact(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={compact ? "header compact" : "header"}>
      <div className="header-inner">
        <Link
          href="/"
          aria-label="ZN Design ana sayfa"
          onClick={() => setOpen(false)}
        >
          <Brand />
        </Link>
        <nav
          id="navigation"
          aria-label="Ana menü"
          className={open ? "navigation open" : "navigation"}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              toggle.current?.focus();
            }
          }}
        >
          {links.map(([url, label]) => (
            <Link
              key={url}
              href={url}
              aria-current={path === url ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/magazamiz"
            className="store-link"
            onClick={() => setOpen(false)}
          >
            Mağazamız <Arrow diagonal />
          </Link>
        </nav>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
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
      <span>Birlikte konuşalım</span>
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
