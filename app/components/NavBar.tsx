"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/schedule", label: "Schedule" },
  { href: "/travel", label: "Travel" },
  { href: "/where-to-stay", label: "Where to Stay" },
  { href: "/faq", label: "FAQ" },
  { href: "/registry", label: "Registry" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-sage relative pb-10">
      {/* Top bar */}
      <div className="px-6 py-3 flex items-center justify-between">
        <Link href="/" aria-label="Home" onClick={() => setOpen(false)}>
          <Image
            src="/dog.png"
            alt="Peanut"
            width={44}
            height={44}
            className="rounded-full object-cover"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-white/90 font-sans">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
          <Link
            href="/rsvp"
            className="bg-white text-sage px-5 py-1.5 font-semibold tracking-wide hover:bg-beige transition-colors rounded-sm"
          >
            RSVP
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-1"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Paintbrush stroke bottom edge — beige wave overlays the sage padding */}
      <svg
        aria-hidden
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        height="40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,28 C100,18 220,38 340,24 C460,12 560,34 680,22 C800,12 920,32 1040,20 C1140,12 1280,30 1440,18 L1440,40 L0,40 Z"
          fill="#F8F4EC"
        />
      </svg>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/20 px-6 py-4 flex flex-col gap-4 font-sans text-white/90">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-base hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rsvp"
            className="mt-1 text-center bg-white text-sage px-5 py-2 font-semibold tracking-wide hover:bg-beige transition-colors rounded-sm"
            onClick={() => setOpen(false)}
          >
            RSVP
          </Link>
        </div>
      )}
    </nav>
  );
}
