'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/guests', label: 'Guests' },
  { href: '/admin/rsvps', label: 'RSVPs' },
  { href: '/admin/registry', label: 'Registry' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="bg-white border-b border-beige-dark sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link href="/admin" className="font-serif text-lg text-brown shrink-0">
          Admin
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5 text-sm overflow-x-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(item.href)
                  ? 'text-brown font-medium whitespace-nowrap'
                  : 'text-brown-light hover:text-brown whitespace-nowrap'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="text-sm text-brown-light hover:text-brown shrink-0"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
