export const metadata = { robots: { index: false, follow: false } };
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-[var(--light)] px-4 py-8 text-[var(--ink)] sm:px-8">
      {children}
    </div>
  );
}
