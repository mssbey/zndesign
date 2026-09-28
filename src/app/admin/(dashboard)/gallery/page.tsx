import { AdminNav } from "@/components/admin-nav";
import { GalleryForm } from "@/components/gallery-form";
import { getGallery } from "@/lib/gallery";
import styles from "@/components/gallery-admin.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fabrika ve Teslimatlar · Yönetim", robots: { index: false, follow: false } };
export default async function GalleryAdmin() {
  const items = await getGallery();
  return <><AdminNav /><h1 className={styles.heading}>Fabrika ve Teslimatlar</h1><p className={styles.intro}>Fotoğraflar Biz Kimiz sayfasında yayınlanır. Fabrika fotoğrafları ana sayfa ve Fabrikamız sayfasında da gösterilir.</p><div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3"><GalleryForm />{items.map(item => <GalleryForm key={item.id} item={item} />)}</div></>;
}
