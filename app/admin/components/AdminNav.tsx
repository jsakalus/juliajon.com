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

  const pills = NAV_ITEMS.map(item => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? 'page' : undefined}
      className={
        isActive(item.href)
          ? 'px-3.5 py-2 rounded-full bg-brown text-white text-sm font-medium whitespace-nowrap'
          : 'px-3.5 py-2 rounded-full bg-beige text-brown-light border border-beige-dark hover:text-brown hover:border-brown/30 text-sm whitespace-nowrap transition-colors'
      }
    >
      {item.label}
    </Link>
  ));

  return (
    <header className="bg-white border-b border-beige-dark sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link href="/admin" className="font-serif text-lg text-brown shrink-0">
            Admin
          </Link>

          {/* Desktop: links inline between brand and sign out */}
          <nav className="hidden sm:flex items-center gap-2">{pills}</nav>

          <button
            onClick={signOut}
            className="text-sm text-brown-light hover:text-brown shrink-0"
          >
            Sign out
          </button>
        </div>

        {/* Mobile: links wrap onto their own row so nothing is clipped */}
        <nav className="sm:hidden flex flex-wrap gap-2 pb-3">{pills}</nav>
      </div>
    </header>
  );
}
