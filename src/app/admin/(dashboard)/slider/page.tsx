import { AdminNav } from "@/components/admin-nav";
import { ContentForm } from "@/components/content-form";
import { contentSections } from "@/lib/content-sections";
import { getSlideOrder, getSlides } from "@/lib/slides";
import { moveSlideAction } from "@/app/admin/content-actions";
import styles from "@/components/gallery-admin.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ana Sayfa Slider · Yönetim", robots: { index: false, follow: false } };
export default async function SliderAdmin() {
  const [slides, order] = await Promise.all([getSlides(), getSlideOrder()]);
  return <><AdminNav /><h1 className={styles.heading}>Ana Sayfa Slider</h1><p className={styles.intro}>Ana sayfanın üst kısmındaki {slides.length} slaytın görsellerini, yazılarını ve bağlantılarını buradan değiştirebilirsiniz. Okları kullanarak slaytların gösterim sırasını değiştirebilirsiniz.</p><div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">{order.map((i, position) => {
    const title = `${position + 1}. slayt`;
    const toolbar = <div className="mb-4 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
      <span>Gösterim sırası: {position + 1} / {order.length}</span>
      <div className="flex gap-1">
        <form action={moveSlideAction.bind(null, i, -1)}><button disabled={position === 0} aria-label={`${title} yukarı taşı`} className="rounded border border-[var(--line)] px-3 disabled:opacity-30">↑</button></form>
        <form action={moveSlideAction.bind(null, i, 1)}><button disabled={position === order.length - 1} aria-label={`${title} aşağı taşı`} className="rounded border border-[var(--line)] px-3 disabled:opacity-30">↓</button></form>
      </div>
    </div>;
    return <ContentForm key={i} section={contentSections[`slide-${i}`]} values={slides[i]} title={title} toolbar={toolbar} />;
  })}</div></>;
}
