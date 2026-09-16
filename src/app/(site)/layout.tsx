import "./woodmart.css";
import {
  Header,
  Footer,
  FloatingContact,
  ScrollReveal,
} from "@/components/shell";
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
