import Image from "next/image";
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
    <div className="relative overflow-x-hidden">

      {/* Flower borders */}
      <div className="fixed left-0 top-0 h-screen hidden xl:block pointer-events-none select-none z-0">
        <Image
          src="/watercolor-flowers-border-left.png"
          alt=""
          width={220}
          height={900}
          className="h-full w-auto object-cover"
        />
      </div>
      <div className="fixed right-0 top-0 h-screen hidden xl:block pointer-events-none select-none z-0">
        <Image
          src="/watercolor-flowers-border-right.png"
          alt=""
          width={220}
          height={900}
          className="h-full w-auto object-cover"
        />
      </div>

      {/* Hero — fills viewport */}
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-8 px-6 text-center gap-3 relative z-10">
        <h1 className="font-serif text-6xl md:text-7xl text-brown font-semibold">Julia &amp; Jonathan</h1>
        <p className="font-sans text-sm tracking-[0.25em] uppercase text-brown-light">May 29, 2027</p>
        <Image
          src="/Julia and Jonathan kiss.png"
          alt="Julia and Jonathan"
          width={862}
          height={651}
          style={{ width: "min(85vw, 600px)", height: "auto" }}
          priority
        />
        <Countdown inline />
      </div>

      {/* Welcome */}
      <div className="max-w-prose mx-auto px-6 pb-12 text-center relative z-10">
        <p className="font-sans text-base text-brown leading-relaxed">
          We can&apos;t wait to celebrate with you in the mountains. Use this site to RSVP,
          get travel info, find a place to stay, and explore everything we have planned
          for the weekend.
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-12 text-sage relative z-10">
        <div className="h-px w-24 bg-sage-light"></div>
        <span className="text-lg">✦</span>
        <div className="h-px w-24 bg-sage-light"></div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl px-6 pb-20 mx-auto relative z-10">
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
