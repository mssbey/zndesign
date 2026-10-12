import { AdminNav } from "@/components/admin-nav";
import { ContentForm } from "@/components/content-form";
import { FabricAdmin } from "@/components/fabric-admin";
import { contentSections } from "@/lib/content-sections";
import { FABRICS_KEY } from "@/lib/fabrics";
import { getContents, getFabricGroups, getStoredValues } from "@/lib/content";
import styles from "@/components/gallery-admin.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kumaş & Renk Kartelası · Yönetim", robots: { index: false, follow: false } };
export default async function FabricsAdmin() {
  const [groups, values, stored] = await Promise.all([getFabricGroups(), getContents(["fabrics-intro"]), getStoredValues([FABRICS_KEY])]);
  return <><AdminNav /><h1 className={styles.heading}>Kumaş & Renk Kartelası</h1><p className={styles.intro}>Kumaş gruplarını, renklerini ve kumaş fotoğraflarını buradan yönetebilirsiniz. Sitede /kumas-renk-kartelasi sayfasında görünür.</p>
    <div className="mb-10 max-w-xl"><ContentForm section={contentSections["fabrics-intro"]} values={values["fabrics-intro"]} /></div>
    <h2 className={styles.heading}>Kumaş grupları ve renkler</h2>
    <FabricAdmin groups={groups} isDefault={!stored[FABRICS_KEY]} />
  </>;
}
