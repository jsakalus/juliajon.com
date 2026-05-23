import Link from "next/link";
import Countdown from "./components/Countdown";

const pages = [
  { href: "/rsvp",          label: "RSVP",          sub: "Let us know you're coming",      accent: "border-t-mauve" },
  { href: "/schedule",      label: "Schedule",       sub: "Weekend itinerary",              accent: "border-t-gold" },
  { href: "/travel",        label: "Travel",         sub: "Getting to Canmore",             accent: "border-t-sage" },
  { href: "/where-to-stay", label: "Where to Stay",  sub: "Accommodation recommendations",  accent: "border-t-lavender" },
  { href: "/faq",           label: "FAQ",            sub: "Common questions answered",      accent: "border-t-terracotta" },
  { href: "/registry",      label: "Registry",       sub: "Our wish list",                  accent: "border-t-gold" },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">

      {/* Hero */}
      <div className="w-full flex flex-col items-center justify-center py-28 px-6 text-center gap-5">
        <h1 className="font-serif italic text-7xl text-brown font-light">Julia & Jonathan</h1>
        <div className="flex items-center gap-5 text-brown-light">
          <div className="h-px w-16 bg-sage-light"></div>
          <p className="font-sans text-sm tracking-[0.25em] uppercase">May 29, 2027</p>
          <div className="h-px w-16 bg-sage-light"></div>
        </div>
        <p className="font-sans text-brown-light text-base">
          Riverside Park & The Bear and Bison Inn · Canmore, Alberta
        </p>
        <div className="mt-6">
          <Countdown />
        </div>
      </div>

      {/* Welcome */}
      <div className="max-w-prose mx-auto px-6 pb-12 text-center">
        <p className="font-sans text-base text-brown leading-relaxed">
          We can't wait to celebrate with you in the mountains. Use this site to RSVP,
          get travel info, find a place to stay, and explore everything we have planned
          for the weekend.
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-12 text-sage">
        <div className="h-px w-24 bg-sage-light"></div>
        <span className="text-lg">✦</span>
        <div className="h-px w-24 bg-sage-light"></div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl px-6 pb-20">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className={`bg-white border-t-4 ${page.accent} p-5 hover:shadow-md transition-shadow`}
          >
            <p className="font-serif text-lg text-brown mb-1">{page.label}</p>
            <p className="font-sans text-sm text-brown-light">{page.sub}</p>
          </Link>
        ))}
      </div>

    </div>
  );
}
