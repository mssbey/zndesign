import { AdminNav } from "@/components/admin-nav";
import { ContentForm } from "@/components/content-form";
import { sectionsFor } from "@/lib/content-sections";
import { getContents } from "@/lib/content";
import styles from "@/components/gallery-admin.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sayfa İçerikleri · Yönetim", robots: { index: false, follow: false } };
const groups = [
  { page: "home" as const, title: "Ana Sayfa", intro: "Ana sayfadaki başlıklar, yazılar, düğmeler ve görseller. Slider ayrı sayfadan yönetilir." },
  { page: "custom" as const, title: "Özel Üretim Sayfası", intro: "/ozel-uretim sayfasındaki yazılar ve görseller." },
];
export default async function ContentAdmin() {
  const sections = groups.flatMap(g => sectionsFor(g.page));
  const values = await getContents(sections.map(s => s.id));
  return <><AdminNav /><h1 className={styles.heading}>Sayfa İçerikleri</h1><p className={styles.intro}>Her kutu ayrı kaydedilir. Görsel seçmezseniz mevcut görsel korunur.</p>
    <nav className="mb-8 flex flex-wrap gap-4 text-sm">{groups.map(g => <a key={g.page} href={`#${g.page}`} className="underline">{g.title}</a>)}</nav>
    {groups.map(g => <section key={g.page} id={g.page} className="mb-12 scroll-mt-6"><h2 className={styles.heading}>{g.title}</h2><p className={styles.intro}>{g.intro}</p><div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">{sectionsFor(g.page).map(s => <ContentForm key={s.id} section={s} values={values[s.id]} />)}</div></section>)}
  </>;
}
