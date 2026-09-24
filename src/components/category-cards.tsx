import Link from "next/link";
import { site } from "@/lib/data";

const icon = { width: 64, height: 64, viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

const icons = {
  set: <svg {...icon} viewBox="0 0 80 64"><path d="M16 30V16a3 3 0 0 1 3-3h42a3 3 0 0 1 3 3v14"/><path d="M8 36a4 4 0 0 1 4-4h56a4 4 0 0 1 4 4v14H8Z"/><path d="M8 42h64M10 50v5M70 50v5"/></svg>,
  headboard: <svg {...icon}><path d="M12 54V16a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v38"/><path d="M12 38h40"/></svg>,
  mattress: <svg {...icon}><path d="M8 30a4 4 0 0 1 4-4h40a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4Z"/><path d="M8 32h48"/><g strokeWidth="2.2"><path d="M16 29h.01M24 29h.01M32 29h.01M40 29h.01M48 29h.01M20 36h.01M28 36h.01M36 36h.01M44 36h.01"/></g></svg>,
  storage: <svg {...icon}><path d="M10 34h44v18H10Z"/><path d="M10 34 44 12l4 6-30 16"/><path d="M14 38h36"/></svg>,
  bedding: <svg {...icon}><path d="M22 14c4 2 16 2 20 0 1 3 1 7 0 10-4-2-16-2-20 0-1-3-1-7 0-10Z"/><path d="M12 30h36a6 6 0 0 1 0 12H12a5 5 0 0 1 0-10"/><path d="M12 42h38a6 6 0 0 1 0 12H12a5 5 0 0 1-5-5v-12"/></svg>,
  kids: <svg {...icon}><circle cx="22" cy="14" r="4"/><circle cx="42" cy="14" r="4"/><circle cx="32" cy="24" r="10"/><path d="M29 22h.01M35 22h.01M30 27c1 1 3 1 4 0"/><path d="M24 32c-5 3-7 9-6 16h28c1-7-1-13-6-16"/><circle cx="19" cy="50" r="5"/><circle cx="45" cy="50" r="5"/></svg>,
  custom: <svg {...icon}><path d="M14 8h10v48H14Z"/><path d="M14 16h5M14 24h5M14 32h5M14 40h5M14 48h5"/><path d="m52 12 4 4-22 22-6 2 2-6Z"/><path d="m48 16 4 4"/></svg>,
};

const cards = [
  { href: "/urunler?kategori=bazalar", icon: icons.set, title: "Baza & Başlık Setleri", text: "Tamamlayıcı ve uyumlu tasarımlar", wide: true },
  { href: "/urunler?kategori=yatak-basliklari", icon: icons.headboard, title: "Yatak Başlıkları", text: "Her tarza uygun başlık modelleri" },
  { href: "/urunler?kategori=yataklar", icon: icons.mattress, title: "Yataklar", text: "Konforlu ve destekleyici uyku deneyimi" },
  { href: "/urunler?kategori=bazalar", icon: icons.storage, title: "Bazalar", text: "Fonksiyonel ve dayanıklı çözümler" },
  { href: "/urunler?kategori=diger-urunler", icon: icons.bedding, title: "Uyku Setleri", text: "Eksiksiz bir uyku deneyimi" },
  { href: "/koleksiyonlar/kids-collection", icon: icons.kids, title: "KIDS / Çocuk Serisi", text: "Minikler için özel tasarımlar" },
  { href: "/ozel-uretim", icon: icons.custom, title: "Özel Üretim", text: "Alanınıza özel ölçü ve tasarım" },
];

const Chevron = () => <svg className="zn-cat-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>;

export function CategoryCards() {
  return <section className="zn-cats" id="kategoriler">
    <div className="wrap">
      <div className="zn-cats-heading"><p>{site.name.toUpperCase()} KOLEKSİYONLARI</p><h2>Öne Çıkan Kategoriler</h2><p>Yaşam alanınız için tasarlanan konforlu ve zamansız seçenekler.</p></div>
      <div className="zn-cats-grid">
        {cards.map(c => <Link key={c.title} href={c.href} className={c.wide ? "zn-cat wide" : "zn-cat"}>
          <span className="zn-cat-icon">{c.icon}</span>
          <span className="zn-cat-copy"><strong>{c.title}</strong><span>{c.text}</span></span>
          <Chevron />
        </Link>)}
      </div>
    </div>
  </section>;
}
