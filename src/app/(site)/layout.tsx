import "./woodmart.css";
import "./zenn.css";
import "./refinements.css";
import {
  Header,
  Footer,
  FloatingContact,
  ScrollReveal,
} from "@/components/shell";
import { TaxonomyProvider } from "@/components/taxonomy-provider";
import { getCategories, getCollections } from "@/lib/taxonomy";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, collections] = await Promise.all([getCategories(), getCollections()]);
  return (
    <TaxonomyProvider categories={categories} collections={collections}>
      <div className="woodmart-site">
        <a href="#main" className="skip-link">
          İçeriğe geç
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <FloatingContact />
        <ScrollReveal />
      </div>
    </TaxonomyProvider>
  );
}
