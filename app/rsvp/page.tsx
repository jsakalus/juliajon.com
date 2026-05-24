"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PeanutCelebration from "../components/PeanutCelebration";

type AttendanceStatus = "yes" | "no" | "maybe" | null;

type Guest = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};

type Party = { id: string; name: string; invited_to_welcome_dinner: boolean };

type RsvpEntry = {
  guest_id: string;
  wedding_attending_status: AttendanceStatus;
  welcome_dinner_status: AttendanceStatus;
  maybe_reason: string;
  dietary_notes: string;
  travel_mode: "flying_booked" | "flying_not_booked" | "driving" | null;
  staying_late: boolean | null;
  email: string;
  cell: string;
};

type SearchResult = {
  party: Party;
  members: Guest[];
  existingResponses: (RsvpEntry & { wedding_attending_status: AttendanceStatus })[];
};

type StatusButtonProps = {
  current: string | boolean | null;
  value: string;
  label: string;
  activeClass: string;
  onClick: () => void;
};

type BoolButtonProps = {
  current: boolean | null;
  value: boolean;
  label: string;
  activeClass: string;
  onClick: () => void;
};

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("1") ? digits.slice(1) : digits;
  const d = local.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function StatusButton({ current, value, label, activeClass, onClick }: StatusButtonProps) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 text-sm rounded-full border transition-colors ${
        isActive ? activeClass : "border-beige-dark text-brown-light hover:border-sage"
      }`}
    >
      {label}
    </button>
  );
}

function BoolButton({ current, value, label, activeClass, onClick }: BoolButtonProps) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 text-sm rounded-full border transition-colors ${
        isActive ? activeClass : "border-beige-dark text-brown-light hover:border-sage"
      }`}
    >
      {label}
    </button>
  );
}

const BLOOMED_FLOWERS = ["🌸", "🌼", "🌻", "🌷", "🌺"];

function FlowerGarden({
  responded,
  newlyBloomed,
  maybe,
  newlySprouted,
  showThankYou = true,
}: {
  responded: number;
  newlyBloomed: number;
  maybe: number;
  newlySprouted: number;
  showThankYou?: boolean;
}) {
  if (responded === 0 && maybe === 0) return null;

  return (
    <div className="text-center py-10">
      <p className="text-xs tracking-[0.2em] uppercase text-brown-light mb-5">
        Our Guest List Is Blooming ♡
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
        {Array.from({ length: responded }).map((_, i) => {
          const isNew = newlyBloomed > 0 && i >= responded - newlyBloomed;
          const emoji = BLOOMED_FLOWERS[i % BLOOMED_FLOWERS.length];
          return (
            <span
              key={`flower-${i}`}
              className="text-2xl inline-block"
              style={{
                animation: "flower-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                animationDelay: isNew
                  ? `${(i - (responded - newlyBloomed)) * 0.12}s`
                  : `${i * 0.025}s`,
              }}
            >
              {emoji}
            </span>
          );
        })}
        {Array.from({ length: maybe }).map((_, i) => {
          const isNew = newlySprouted > 0 && i >= maybe - newlySprouted;
          return (
            <span
              key={`seedling-${i}`}
              className="text-2xl inline-block"
              style={{
                animation: "flower-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                animationDelay: isNew
                  ? `${(i - (maybe - newlySprouted)) * 0.12}s`
                  : `${(responded + i) * 0.025}s`,
              }}
            >
              🌱
            </span>
          );
        })}
      </div>
      {showThankYou && (
        <p className="font-handwritten text-sage text-xl mt-5">
          thank you to everyone who&apos;s already replied!
        </p>
      )}
    </div>
  );
}

export default function RSVP() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, RsvpEntry>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPeanut, setShowPeanut] = useState(false);
  const [gardenCount, setGardenCount] = useState({ responded: 0, maybe: 0, total: 0 });
  const [newlyBloomed, setNewlyBloomed] = useState(0);
  const [newlySprouted, setNewlySprouted] = useState(0);
  const [blooming, setBlooming] = useState(false);
  const [bloomFading, setBloomFading] = useState(false);
  const [bloomFlowers, setBloomFlowers] = useState<string[]>([]);
  const [gardenVisible, setGardenVisible] = useState(false);
  const [showMaybePop, setShowMaybePop] = useState(false);
  const [showYesRun, setShowYesRun] = useState(false);
  const [showYesDinner, setShowYesDinner] = useState(false);
  const [showPartySlide, setShowPartySlide] = useState(false);
  const [showAirplane, setShowAirplane] = useState(false);
  const [showVan, setShowVan] = useState(false);
  const [showPleasePeanut, setShowPleasePeanut] = useState(false);
  const snoreCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    fetch("/api/rsvp/count", { cache: "no-store" })
      .then((r) => r.json())
      .then(setGardenCount)
      .catch(() => {});
  }, []);

  const playBoing = () => {
    try {
      const ctx = new AudioContext();
      const delay = 0.15;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(310, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(68, ctx.currentTime + delay + 0.7);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.0);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + delay + 1.0);
    } catch {
      // audio not supported
    }
  };

  const handleYesClick = (memberId: string) => {
    updateResponse(memberId, "wedding_attending_status", "yes");
    setShowYesRun(true);
    setTimeout(() => setShowYesRun(false), 2100);
  };

  const playAirplaneSound = () => {
    try {
      const ctx = new AudioContext();
      const bufLen = ctx.sampleRate * 1.8;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3500, ctx.currentTime + 1.8);
      filter.Q.value = 1.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.35, ctx.currentTime + 1.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start(); noise.stop(ctx.currentTime + 1.8);
    } catch { /* audio not supported */ }
  };

  const handleAirplaneClick = (memberId: string) => {
    updateResponse(memberId, "travel_mode", "flying_booked");
    playAirplaneSound();
    setShowAirplane(true);
    setTimeout(() => setShowAirplane(false), 1900);
  };

  const handleVanHover = () => {
    if (showVan) return;
    setShowVan(true);
    setTimeout(() => setShowVan(false), 3600);
  };

  const playBeatbox = () => {
    try {
      const ctx = new AudioContext();
      const kick = (t: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        g.gain.setValueAtTime(0.9, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t); osc.stop(t + 0.2);
      };
      const hat = (t: number) => {
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
        const g = ctx.createGain();
        src.connect(f); f.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        src.start(t);
      };
      const snare = (t: number) => {
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const g = ctx.createGain();
        src.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        src.start(t);
      };
      const b = 60 / 130; // beat at 130 bpm
      kick(ctx.currentTime);         hat(ctx.currentTime);
      hat(ctx.currentTime + b * 0.5);
      snare(ctx.currentTime + b);    hat(ctx.currentTime + b);
      hat(ctx.currentTime + b * 1.5);
      kick(ctx.currentTime + b * 2); hat(ctx.currentTime + b * 2);
      kick(ctx.currentTime + b * 2.5);
      snare(ctx.currentTime + b * 3); hat(ctx.currentTime + b * 3);
      hat(ctx.currentTime + b * 3.5);
    } catch { /* audio not supported */ }
  };

  const startSnore = () => {
    try {
      if (snoreCtxRef.current) return;
      const ctx = new AudioContext();
      snoreCtxRef.current = ctx;

      // Looped noise through a low-pass for that muffled snore quality
      const bufLen = ctx.sampleRate;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 160;
      filter.Q.value = 3;

      const master = ctx.createGain();
      master.gain.value = 0.1;

      // Slow LFO for breathing rhythm (~0.6 Hz)
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.6;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.09;
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);

      noise.connect(filter);
      filter.connect(master);
      master.connect(ctx.destination);

      lfo.start();
      noise.start();
    } catch { /* audio not supported */ }
  };

  const stopSnore = () => {
    if (snoreCtxRef.current) {
      snoreCtxRef.current.close().catch(() => {});
      snoreCtxRef.current = null;
    }
  };

  const handlePartyClick = (memberId: string) => {
    updateResponse(memberId, "staying_late", true);
    playBeatbox();
    setShowPartySlide(true);
    setTimeout(() => setShowPartySlide(false), 1600);
  };

  const handleYesDinnerClick = (memberId: string) => {
    updateResponse(memberId, "welcome_dinner_status", "yes");
    setShowYesDinner(true);
    setTimeout(() => setShowYesDinner(false), 1600);
  };

  const handleMaybeClick = (memberId: string) => {
    setResponses((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        wedding_attending_status: "maybe",
        welcome_dinner_status: null,
        travel_mode: null,
        staying_late: null,
        dietary_notes: "",
        email: "",
        cell: "",
      },
    }));
    playBoing();
    setShowMaybePop(true);
    setTimeout(() => setShowMaybePop(false), 1400);
  };

  const updateResponse = (guestId: string, field: keyof RsvpEntry, value: unknown) => {
    setResponses((prev) => ({ ...prev, [guestId]: { ...prev[guestId], [field]: value } }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/rsvp/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      if (data.error === "needs_last_name") {
        setError("We found more than one guest with that first name. Please enter your last name too.");
      } else {
        setError("We couldn't find your invitation. Double-check your name and try again, or reach out to us directly.");
      }
      return;
    }

    const data: SearchResult = await res.json();
    setResult(data);

    const initial: Record<string, RsvpEntry> = {};
    data.members.forEach((member) => {
      const existing = data.existingResponses?.find((r) => r.guest_id === member.id);
      initial[member.id] = {
        guest_id: member.id,
        wedding_attending_status: existing?.wedding_attending_status ?? null,
        welcome_dinner_status: existing?.welcome_dinner_status ?? null,
        maybe_reason: existing?.maybe_reason ?? "",
        dietary_notes: existing?.dietary_notes ?? "",
        travel_mode: existing?.travel_mode ?? null,
        staying_late: existing?.staying_late ?? null,
        email: member.email ?? "",
        cell: member.phone ? formatPhone(member.phone) : "",
      };
    });
    setResponses(initial);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await fetch("/api/rsvp/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: Object.values(responses) }),
    });

    const members = result?.members ?? [];
    const prevResponded = gardenCount.responded;

    const newYesGuests = members.filter((m) => {
      const wasYes = result?.existingResponses?.find((e) => e.guest_id === m.id)?.wedding_attending_status === "yes";
      return responses[m.id]?.wedding_attending_status === "yes" && !wasYes;
    });
    const upgradedFromMaybe = members.filter((m) => {
      const wasMaybe = result?.existingResponses?.find((e) => e.guest_id === m.id)?.wedding_attending_status === "maybe";
      return responses[m.id]?.wedding_attending_status === "yes" && wasMaybe;
    });
    const downgradedToMaybe = members.filter((m) => {
      const wasYes = result?.existingResponses?.find((e) => e.guest_id === m.id)?.wedding_attending_status === "yes";
      return responses[m.id]?.wedding_attending_status === "maybe" && wasYes;
    });
    const newFirstTimeMaybe = members.filter((m) => {
      const prev = result?.existingResponses?.find((e) => e.guest_id === m.id)?.wedding_attending_status;
      return responses[m.id]?.wedding_attending_status === "maybe" && !prev;
    });

    const yesCount = newYesGuests.length;
    const allNewSeedlings = downgradedToMaybe.length + newFirstTimeMaybe.length;
    const myFlowers: string[] = [
      ...newYesGuests.map((_, i) => BLOOMED_FLOWERS[(prevResponded + i) % BLOOMED_FLOWERS.length]),
      ...downgradedToMaybe.map(() => "🌱"),
      ...newFirstTimeMaybe.map(() => "🌱"),
    ];

    setBloomFlowers(myFlowers);
    setNewlyBloomed(yesCount);
    setNewlySprouted(allNewSeedlings);
    setGardenCount((prev) => ({
      ...prev,
      responded: prev.responded + yesCount - downgradedToMaybe.length,
      maybe: prev.maybe + allNewSeedlings - upgradedFromMaybe.length,
    }));
    setSubmitting(false);
    setSubmitted(true);
    setShowPeanut(true);

    // Save the searched guest's ID + name so the registry page can attribute contributions
    const searchedGuest = result?.members[0];
    if (searchedGuest) {
      localStorage.setItem("rsvp_guest_id", searchedGuest.id);
      const name = [searchedGuest.first_name, searchedGuest.last_name].filter(Boolean).join(" ");
      if (name) localStorage.setItem("rsvp_guest_name", name);
    }

    if (myFlowers.length > 0) {
      setBlooming(true);
      setTimeout(() => setBloomFading(true), 3200);
      setTimeout(() => setGardenVisible(true), 3800);
      setTimeout(() => { setBlooming(false); setBloomFading(false); }, 4200);
    } else {
      setGardenVisible(true);
    }
  };

  const gardenProps = {
    responded: gardenCount.responded,
    newlyBloomed,
    maybe: gardenCount.maybe,
    newlySprouted,
  };
  const garden = <FlowerGarden {...gardenProps} />;
  const gardenPostSubmit = <FlowerGarden {...gardenProps} showThankYou={false} />;

  const bloomOverlay = blooming && bloomFlowers.length > 0 && (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none gap-2"
      style={bloomFading ? { animation: "fade-out 1s ease-out forwards" } : undefined}
    >
      {bloomFlowers.map((flower, i) => (
        <span
          key={i}
          className="text-[8rem] leading-none inline-block"
          style={{
            animation: "flower-bloom-big 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {flower}
        </span>
      ))}
      <p
        className="font-handwritten text-sage text-4xl mt-2"
        style={{
          animation: "flower-bloom-big 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          animationDelay: `${bloomFlowers.length * 0.3}s`,
        }}
      >
        {bloomFlowers.every((f) => f === "🌱") ? "your seedling is planted" : "your flower is planted"}
      </p>
    </div>
  );

  if (submitted) {
    return (
      <>
        {showPeanut && <PeanutCelebration onDismiss={() => setShowPeanut(false)} />}
        {bloomOverlay}
        <div
          className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-8 transition-opacity duration-1000"
          style={{ opacity: gardenVisible ? 1 : 0 }}
        >
          {gardenPostSubmit}
          <a
            href="/"
            className="inline-block px-8 py-3 bg-sage text-white text-sm tracking-widest uppercase rounded-full hover:bg-sage-dark transition-colors"
          >
            Wedding Details
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      {showPeanut && <PeanutCelebration onDismiss={() => setShowPeanut(false)} />}

      {showYesRun && (
        <div className="fixed pointer-events-none z-50" style={{ top: -20, left: -20 }}>
          <Image
            src="/peanut/Yes wedding.png"
            alt=""
            width={140}
            height={140}
            style={{ animation: "yes-run 2s linear forwards" }}
          />
        </div>
      )}

      {showAirplane && (
        <div className="fixed bottom-0 left-0 pointer-events-none z-50 text-6xl"
          style={{ animation: "airplane-fly 1.9s ease-in forwards" }}>
          ✈️
        </div>
      )}

      {showVan && (
        <div className="fixed bottom-5 right-0 pointer-events-none z-50 text-6xl"
          style={{ animation: "van-drive 3.5s linear forwards" }}>
          🚐
        </div>
      )}

      {showPartySlide && (
        <div className="fixed left-0 top-1/3 pointer-events-none z-50">
          <Image
            src="/peanut/Party.png"
            alt=""
            width={120}
            height={120}
            style={{ animation: "party-slide 1.6s ease-in-out forwards" }}
          />
        </div>
      )}

      {showYesDinner && (
        <div className="fixed right-0 bottom-0 pointer-events-none z-50">
          <Image
            src="/peanut/Yes dinner.png"
            alt=""
            width={120}
            height={120}
            style={{ animation: "yes-dinner-slide 1.6s ease-in-out forwards" }}
          />
        </div>
      )}

      {showMaybePop && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <Image
            src="/peanut/Maybe.png"
            alt=""
            width={220}
            height={220}
            style={{ animation: "maybe-boing 1.4s ease-out forwards" }}
          />
        </div>
      )}

      <div className="relative overflow-x-hidden">

        <div className="max-w-2xl mx-auto px-6">

          {/* ── Hero ── */}
          <div className="text-center pt-12 pb-8 relative">

            {/* "Please RSVP" */}
            <div className="flex items-end justify-center gap-3 md:gap-5 mb-1">
              <div
                className="relative inline-block pb-2"
                onMouseEnter={() => setShowPleasePeanut(true)}
                onMouseLeave={() => setShowPleasePeanut(false)}
              >
                <span
                  className="font-serif italic text-xl md:text-2xl text-brown font-normal inline-block"
                  style={{ animation: "please-bounce 2s ease-in-out infinite" }}
                >
                  Please
                </span>
                {showPleasePeanut && (
                  <Image
                    src="/peanut/Please.png"
                    alt=""
                    width={80}
                    height={80}
                    unoptimized
                    className="absolute pointer-events-none"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      animation: "please-lay 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                      zIndex: 10,
                    }}
                  />
                )}
              </div>
              <span className="font-serif text-5xl md:text-7xl text-brown leading-none" style={{ fontWeight: 700 }}>
                RSVP
              </span>
            </div>

            {/* "ASAP" */}
            <div className="leading-none mb-2">
              <span
                className="font-serif text-[5.5rem] md:text-[9rem] text-brown leading-none tracking-tight"
                style={{ fontWeight: 900 }}
              >
                ASAP
              </span>
            </div>

            {/* Deadline */}
            <p className="font-sans text-brown-light text-sm md:text-base tracking-wide mt-1">
              or by Jan 1, 2027
            </p>

            {/* Subhead */}
            <p className="font-serif italic text-xl md:text-2xl text-brown-light mt-4">
              (this really helps us)
            </p>
          </div>

          {/* ── Search form ── */}
          <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-sm p-8 relative mb-8">
            <div className="flex gap-4 mb-6">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs tracking-widest uppercase text-brown-light">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border border-beige-dark bg-beige px-3 py-3 text-sm w-full rounded-xl focus:outline-none focus:border-sage pr-9"
                    placeholder="First name"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-light text-base pointer-events-none select-none">
                    ✿
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs tracking-widest uppercase text-brown-light">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border border-beige-dark bg-beige px-3 py-3 text-sm w-full rounded-xl focus:outline-none focus:border-sage pr-9"
                    placeholder="Last name"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-light text-base pointer-events-none select-none">
                    ✿
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 flex-wrap">
              <button
                type="submit"
                disabled={loading}
                className="bg-sage text-white px-8 py-3.5 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors rounded-full disabled:opacity-50 font-semibold"
              >
                {loading ? "Searching…" : "Find My Invitation"}
              </button>
            </div>
          </form>

          {/* ── Error ── */}
          {error && (
            <div className="bg-white p-6 border-l-4 border-l-mauve rounded-xl mb-6">
              <p className="text-sm text-brown-light">{error}</p>
            </div>
          )}

          {/* ── RSVP form ── */}
          {result && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-8">
              <p className="font-serif italic text-3xl text-sage-dark">
                Found your invitation! 🎉
              </p>

              {result.members.map((member) => {
                const r = responses[member.id];
                const existingResponse = result.existingResponses?.find((e) => e.guest_id === member.id);
                const previouslyDeclined = existingResponse?.wedding_attending_status === "no";
                const currentlySelectingNo = r?.wedding_attending_status === "no";
                const currentlySelectingMaybe = r?.wedding_attending_status === "maybe";

                return (
                  <div key={member.id} className="bg-white p-6 flex flex-col gap-5 rounded-2xl shadow-sm">
                    <p className="font-serif text-xl text-brown">
                      {member.first_name}{member.last_name ? ` ${member.last_name}` : ""}
                    </p>

                    {previouslyDeclined ? (
                      <div className="bg-beige rounded-xl p-4">
                        <p className="text-sm text-brown-light leading-relaxed">
                          You&apos;ve already declined — your response has been recorded. If that&apos;s changed, please get in touch with us directly.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Wedding attendance */}
                        <div className="flex flex-col gap-2">
                          <p className="text-xs tracking-widest uppercase text-brown-light">
                            Attending the wedding?{" "}
                            <span className="normal-case font-normal not-italic">(Saturday, May 29, 2027)</span>
                          </p>
                          <div className="flex gap-3 flex-wrap">
                            <StatusButton
                              current={r?.wedding_attending_status ?? null}
                              value="yes"
                              label="Yes, I'll be there"
                              activeClass="bg-sage text-white border-sage"
                              onClick={() => handleYesClick(member.id)}
                            />
                            <StatusButton
                              current={r?.wedding_attending_status ?? null}
                              value="maybe"
                              label="Maybe"
                              activeClass="bg-gold text-white border-gold"
                              onClick={() => handleMaybeClick(member.id)}
                            />
                            <div className="relative group inline-flex items-center">
                              <StatusButton
                                current={r?.wedding_attending_status ?? null}
                                value="no"
                                label="Regretfully, no"
                                activeClass="bg-mauve text-white border-mauve"
                                onClick={() => updateResponse(member.id, "wedding_attending_status", "no")}
                              />
                              <Image
                                src="/peanut/Regretfully no.png"
                                alt=""
                                width={48}
                                height={48}
                                className="absolute left-full ml-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                style={{ width: 44, height: "auto" }}
                              />
                            </div>
                          </div>
                          {currentlySelectingNo && (
                            <p className="text-xs text-brown-light mt-1 leading-relaxed">
                              Heads up — once you RSVP no, we will assume you are not coming and there will not be a space for you at the venue. If anything shifts, reach out to us directly.
                            </p>
                          )}
                        </div>

                        {/* All follow-up questions hidden when selecting no */}
                        {!currentlySelectingNo && (
                        <>

                        {/* Maybe reason */}
                        {r?.wedding_attending_status === "maybe" && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs tracking-widest uppercase text-brown-light">
                              Anything you&apos;d like us to know? <span className="normal-case">(optional)</span>
                            </label>
                            <textarea
                              value={r.maybe_reason}
                              onChange={(e) => updateResponse(member.id, "maybe_reason", e.target.value)}
                              className="border border-beige-dark bg-white px-3 py-2.5 text-sm w-full rounded-lg focus:outline-none focus:border-sage resize-none"
                              rows={2}
                              placeholder="e.g. waiting on a work trip, figuring out travel…"
                            />
                          </div>
                        )}

                        {!currentlySelectingMaybe && (
                        <>

                        {/* Welcome dinner */}
                        {result.party.invited_to_welcome_dinner && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs tracking-widest uppercase text-brown-light">
                              Attending the welcome dinner?{" "}
                              <span className="normal-case">(Friday, May 28)</span>
                            </p>
                            <div className="flex gap-3 flex-wrap">
                              <StatusButton
                                current={r?.welcome_dinner_status ?? null}
                                value="yes"
                                label="Yes"
                                activeClass="bg-sage text-white border-sage"
                                onClick={() => handleYesDinnerClick(member.id)}
                              />
                              <StatusButton
                                current={r?.welcome_dinner_status ?? null}
                                value="maybe"
                                label="Maybe"
                                activeClass="bg-gold text-white border-gold"
                                onClick={() => updateResponse(member.id, "welcome_dinner_status", "maybe")}
                              />
                              <StatusButton
                                current={r?.welcome_dinner_status ?? null}
                                value="no"
                                label="No"
                                activeClass="bg-mauve text-white border-mauve"
                                onClick={() => updateResponse(member.id, "welcome_dinner_status", "no")}
                              />
                            </div>
                          </div>
                        )}

                        {/* Flights */}
                        <div className="flex flex-col gap-2">
                          <p className="text-xs tracking-widest uppercase text-brown-light">
                            Have you booked your flights yet?
                          </p>
                          <div className="flex gap-3 flex-wrap">
                            <StatusButton
                              current={r?.travel_mode ?? null}
                              value="flying_booked"
                              label="Yep, booked!"
                              activeClass="bg-sage text-white border-sage"
                              onClick={() => handleAirplaneClick(member.id)}
                            />
                            <StatusButton
                              current={r?.travel_mode ?? null}
                              value="flying_not_booked"
                              label="Not yet"
                              activeClass="bg-gold text-white border-gold"
                              onClick={() => updateResponse(member.id, "travel_mode", "flying_not_booked")}
                            />
                            <div className="inline-flex" onMouseEnter={handleVanHover}>
                              <StatusButton
                                current={r?.travel_mode ?? null}
                                value="driving"
                                label="I'm driving"
                                activeClass="bg-sage text-white border-sage"
                                onClick={() => updateResponse(member.id, "travel_mode", "driving")}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Party hard */}
                        <div className="flex flex-col gap-2">
                          <p className="text-xs tracking-widest uppercase text-brown-light">
                            Are you ready to party? 🪩
                          </p>
                          <p className="text-xs text-brown-light -mt-1 leading-relaxed">
                            We&apos;re figuring out how late to keep the bar open. There&apos;s a hot tub, karaoke, and we have the inn to ourselves all night long.
                          </p>
                          <div className="flex gap-3">
                            <BoolButton
                              current={r?.staying_late ?? null}
                              value={true}
                              label="Obviously 🎉"
                              activeClass="bg-lavender text-white border-lavender"
                              onClick={() => handlePartyClick(member.id)}
                            />
                            <div className="relative group inline-flex items-center" onMouseEnter={startSnore} onMouseLeave={stopSnore}>
                              <Image
                                src="/peanut/Slip out early.png"
                                alt=""
                                width={52}
                                height={52}
                                className="absolute left-full ml-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                style={{ height: "auto" }}
                              />
                              <BoolButton
                                current={r?.staying_late ?? null}
                                value={false}
                                label="I'll slip out early"
                                activeClass="bg-brown-light text-white border-brown-light"
                                onClick={() => updateResponse(member.id, "staying_late", false)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dietary notes */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs tracking-widest uppercase text-brown-light">Dietary notes</label>
                          <textarea
                            value={r?.dietary_notes ?? ""}
                            onChange={(e) => updateResponse(member.id, "dietary_notes", e.target.value)}
                            className="border border-beige-dark bg-white px-3 py-2.5 text-sm w-full rounded-lg focus:outline-none focus:border-sage resize-none"
                            rows={2}
                            placeholder="Allergies, dietary restrictions, etc. Leave blank if none."
                          />
                        </div>

                        {/* Contact info */}
                        <div className="flex flex-col gap-3">
                          <p className="text-xs tracking-widest uppercase text-brown-light">
                            Contact info <span className="normal-case">(so we can reach you)</span>
                          </p>
                          <div className="flex gap-4">
                            <div className="flex flex-col gap-1.5 flex-1">
                              <label className="text-xs text-brown-light">Email</label>
                              <input
                                type="email"
                                value={r?.email ?? ""}
                                onChange={(e) => updateResponse(member.id, "email", e.target.value)}
                                className="border border-beige-dark bg-white px-3 py-2.5 text-sm w-full rounded-lg focus:outline-none focus:border-sage"
                                placeholder="your@email.com"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                              <label className="text-xs text-brown-light">Cell</label>
                              <div className="flex items-center border border-beige-dark bg-white rounded-lg overflow-hidden focus-within:border-sage focus-within:ring-0 transition-colors">
                                <span className="px-3 py-2.5 text-sm text-brown-light bg-beige border-r border-beige-dark select-none whitespace-nowrap">+1</span>
                                <input
                                  type="tel"
                                  value={r?.cell ?? ""}
                                  onChange={(e) => updateResponse(member.id, "cell", formatPhone(e.target.value))}
                                  className="px-3 py-2.5 text-sm w-full focus:outline-none bg-white"
                                  placeholder="(555) 000-0000"
                                />
                              </div>
                              {(() => {
                                const val = r?.cell ?? "";
                                const digits = val.replace(/\D/g, "");
                                return val !== "" && digits.length > 0 && digits.length < 10 ? (
                                  <p className="text-xs text-red-400">US or Canada numbers only — enter 10 digits</p>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </div>

                        </>
                        )}
                        </>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={submitting}
                className="bg-sage text-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors self-start rounded-full disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit RSVP"}
              </button>
            </form>
          )}

          {/* ── Garden ── */}
          {garden}

        </div>
      </div>
    </>
  );
}
