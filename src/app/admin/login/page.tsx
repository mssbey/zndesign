import Link from "next/link";
import { Brand } from "@/components/shared";
import { AdminLoginForm } from "@/components/admin-login-form";
export const metadata = { robots: { index: false, follow: false } };
export default function AdminLoginPage() {
  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <Brand />
        <p className="eyebrow admin-login-eyebrow">YÖNETİM PANELİ</p>
        <h1>Hoş geldiniz.</h1>
        <p className="admin-login-subtitle">
          Ürünleri yönetmek için şifrenizle giriş yapın.
        </p>
        <AdminLoginForm />
        <Link href="/" className="admin-login-back">
          &lt; Siteye dön
        </Link>
      </div>
    </div>
  );
}
