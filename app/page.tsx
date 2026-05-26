import Image from "next/image";
import Link from "next/link";
import Countdown from "./components/Countdown";
import PeanutRain from "./components/PeanutRain";
import HomeGarden from "./components/HomeGarden";
import { getSupabase } from "@/lib/supabase";

const pages = [
  { href: "/schedule",      label: "Schedule",      sub: "Weekend Itinerary",              btn: "SEE SCHEDULE",   img: "/nav/schedule.png",      btnClass: "bg-sage" },
  { href: "/travel",        label: "Travel",        sub: "Getting to Canmore",             btn: "TRAVEL INFO",    img: "/nav/travel.png",         btnClass: "bg-sage" },
  { href: "/where-to-stay", label: "Where to Stay", sub: "Accommodation Recommendations",  btn: "FIND A PLACE",   img: "/nav/where-to-stay.png",  btnClass: "bg-sage" },
  { href: "/faq",           label: "FAQs",          sub: "Common questions answered",      btn: "GET ANSWERS",    img: "/nav/faqs.png",           btnClass: "bg-sage" },
  { href: "/registry",      label: "Registry",      sub: "Our wish list",                  btn: "VIEW REGISTRY",  img: "/nav/registry.png",       btnClass: "bg-sage" },
  { href: "/rsvp",          label: "RSVP",          sub: "Let us know if you're coming",   btn: "RSVP NOW",       img: "/nav/rsvp.png",           btnClass: "bg-mauve" },
];

async function getGardenData() {
  try {
    const { data: rows } = await getSupabase()
      .from("rsvp_responses")
      .select("guest_id, wedding_attending_status, guests(first_name, last_name)")
      .in("wedding_attending_status", ["yes", "maybe"])
      .order("submitted_at", { ascending: true });

    const toInitials = (first: string, last: string | null) =>
      [first, last].filter(Boolean).map((p) => p![0].toUpperCase() + ".").join("");

    const yesRows = (rows ?? []).filter((r) => r.wedding_attending_status === "yes");
    const maybeRows = (rows ?? []).filter((r) => r.wedding_attending_status === "maybe");

    return {
      responded: yesRows.length,
      maybe: maybeRows.length,
      yesNames: yesRows.map((r) => {
        const g = r.guests as unknown as { first_name: string; last_name: string | null } | null;
        return g ? toInitials(g.first_name, g.last_name) : "";
      }).filter(Boolean) as string[],
      maybeNames: maybeRows.map((r) => {
        const g = r.guests as unknown as { first_name: string; last_name: string | null } | null;
        return g ? toInitials(g.first_name, g.last_name) : "";
      }).filter(Boolean) as string[],
    };
  } catch {
    return { responded: 0, maybe: 0, yesNames: [], maybeNames: [] };
  }
}

export default async function Home() {
  const gardenData = await getGardenData();
  return (
    <div className="relative overflow-x-hidden">
      <PeanutRain />

      {/* Hero — fills viewport */}
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-8 px-6 text-center gap-3 relative z-10">

        <h1 className="font-serif text-6xl md:text-7xl text-brown font-semibold">Julia &amp; Jonathan</h1>
        <p className="font-sans text-sm tracking-[0.25em] uppercase text-brown-light">May 29, 2027</p>
        <Image
          src="/illustrations/julia-and-jonathan-kiss.png"
          alt="Julia and Jonathan"
          width={862}
          height={651}
          style={{ width: "min(85vw, 600px)", height: "auto" }}
          priority
        />
        <Countdown inline />
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-4 mb-12 text-sage relative z-10">
        <div className="h-px w-24 bg-sage-light"></div>
        <span className="text-lg">✦</span>
        <div className="h-px w-24 bg-sage-light"></div>
      </div>

      {/* Garden + RSVP CTA */}
      <div className="relative z-10 mb-12">
        <HomeGarden
          initialResponded={gardenData.responded}
          initialMaybe={gardenData.maybe}
          initialYesNames={gardenData.yesNames}
          initialMaybeNames={gardenData.maybeNames}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-4 mb-12 text-sage relative z-10">
        <div className="h-px w-24 bg-sage-light"></div>
        <span className="text-lg">✦</span>
        <div className="h-px w-24 bg-sage-light"></div>
      </div>

      {/* Everything you need */}
      <div className="text-center mb-12 relative z-10">
        <h2 className="font-handwritten text-5xl text-sage">everything you need</h2>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 w-full max-w-4xl px-8 pb-20 mx-auto relative z-10">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="flex flex-col items-center text-center gap-3 group h-full"
          >
            <Image
              src={page.img}
              alt={page.label}
              width={200}
              height={200}
              className="w-48 h-48 object-contain"
            />
            <p className="font-serif text-xl text-brown">{page.label}</p>
            <p className="font-sans text-sm text-brown-light flex-1">{page.sub}</p>
            <span className={`mt-auto px-5 py-2 rounded-full ${page.btnClass} text-white text-xs font-sans tracking-widest uppercase whitespace-nowrap group-hover:scale-105 transition-transform duration-200`}>
              {page.btn}
            </span>
          </Link>
        ))}
      </div>

    </div>
  );
}
