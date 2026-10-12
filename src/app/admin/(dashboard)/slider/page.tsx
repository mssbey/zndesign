import { AdminNav } from "@/components/admin-nav";
import { ContentForm } from "@/components/content-form";
import { contentSections } from "@/lib/content-sections";
import { getSlides } from "@/lib/slides";
import styles from "@/components/gallery-admin.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ana Sayfa Slider · Yönetim", robots: { index: false, follow: false } };
export default async function SliderAdmin() {
  const slides = await getSlides();
  return <><AdminNav /><h1 className={styles.heading}>Ana Sayfa Slider</h1><p className={styles.intro}>Ana sayfanın üst kısmındaki {slides.length} slaytın görsellerini, yazılarını ve bağlantılarını buradan değiştirebilirsiniz.</p><div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">{slides.map((slide, i) => <ContentForm key={i} section={contentSections[`slide-${i}`]} values={slide} />)}</div></>;
}
