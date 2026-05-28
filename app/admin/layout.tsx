import { headers } from 'next/headers';
import AdminNav from './components/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-beige">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
