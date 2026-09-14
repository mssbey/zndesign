import { AdminLoginForm } from "@/components/admin-login-form";
export const metadata = { robots: { index: false, follow: false } };
export default function AdminLoginPage() {
  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">ZN Design · Yönetim Girişi</h1>
      <AdminLoginForm />
    </div>
  );
}
