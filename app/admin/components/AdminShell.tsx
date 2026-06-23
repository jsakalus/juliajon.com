'use client';

import { usePathname } from 'next/navigation';
import AdminNav from './AdminNav';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  // Read pathname on the client so the chrome re-evaluates on navigation.
  // A server layout reading headers() would be cached and go stale after sign-in.
  const isLogin = usePathname() === '/admin/login';

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-beige">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</div>
    </div>
  );
}
