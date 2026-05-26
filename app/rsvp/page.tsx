"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import PeanutCelebration from "../components/PeanutCelebration";
import { BLOOMED_FLOWERS } from "../../lib/flowers";

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


function Flower({ emoji, name, style }: { emoji: string; name?: string; style?: React.CSSProperties }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="text-2xl inline-block relative cursor-default select-none"
      style={style}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((v) => !v)}
    >
      {emoji}
      {show && name && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-brown text-white rounded whitespace-nowrap pointer-events-none z-10 font-sans">
          {name}
        </span>
      )}
    </span>
  );
}

function FlowerGarden({
  responded,
  newlyBloomed,
  maybe,
  newlySprouted,
  showThankYou = true,
  yesNames = [],
  maybeNames = [],
}: {
  responded: number;
  newlyBloomed: number;
  maybe: number;
  newlySprouted: number;
  showThankYou?: boolean;
  yesNames?: string[];
  maybeNames?: string[];
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
          return (
            <Flower
              key={`flower-${i}`}
              emoji={BLOOMED_FLOWERS[i % BLOOMED_FLOWERS.length]}
              name={yesNames[i]}
              style={{
                animation: "flower-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                animationDelay: isNew
                  ? `${(i - (responded - newlyBloomed)) * 0.12}s`
                  : `${i * 0.025}s`,
              }}
            />
          );
        })}
        {Array.from({ length: maybe }).map((_, i) => {
          const isNew = newlySprouted > 0 && i >= maybe - newlySprouted;
          return (
            <Flower
              key={`seedling-${i}`}
              emoji="🌱"
              name={maybeNames[i]}
              style={{
                animation: "flower-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                animationDelay: isNew
                  ? `${(i - (maybe - newlySprouted)) * 0.12}s`
                  : `${(responded + i) * 0.025}s`,
              }}
            />
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
  return (
    <Suspense>
      <RSVPInner />
    </Suspense>
  );
}

function RSVPInner() {
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [responses, setResponses] = useState<Record<string, RsvpEntry>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPeanut, setShowPeanut] = useState(false);
  const [gardenCount, setGardenCount] = useState({ responded: 0, maybe: 0, total: 0 });
  const [gardenNames, setGardenNames] = useState<{ yesNames: string[]; maybeNames: string[] }>({ yesNames: [], maybeNames: [] });
  const [newlyBloomed, setNewlyBloomed] = useState(0);
  const [newlySprouted, setNewlySprouted] = useState(0);
  const [blooming, setBlooming] = useState(false);
  const [bloomFading, setBloomFading] = useState(false);
  const [bloomFlowers, setBloomFlowers] = useState<string[]>([]);
  const [gardenVisible, setGardenVisible] = useState(false);
  const [showMaybePop, setShowMaybePop] = useState(false);
  const [showYesDinner, setShowYesDinner] = useState(false);
  const [showPartySlide, setShowPartySlide] = useState(false);
  const [showAirplane, setShowAirplane] = useState(false);
  const [showVan, setShowVan] = useState(false);
  const [showPleasePeanut, setShowPleasePeanut] = useState(false);
  const snoreCtxRef = useRef<AudioContext | null>(null);
  const snoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiAnimRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current); };
  }, []);

  useEffect(() => {
    ["/peanut/Maybe.png", "/peanut/Party.png", "/peanut/Yes dinner.png",
     "/peanut/Regretfully no.png", "/peanut/Slip out early.png",
     "/peanut/Please.png", "/peanut/peanut-celebrate.png"].forEach((src) => {
      const img = new window.Image(); img.src = src;
    });
  }, []);

  useEffect(() => {
    fetch("/api/rsvp/count", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setGardenCount(data);
        setGardenNames({ yesNames: data.yesNames ?? [], maybeNames: data.maybeNames ?? [] });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const guestId = searchParams.get("guestId");
    if (!guestId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/rsvp/search?guestId=${encodeURIComponent(guestId)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: SearchResult) => {
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
      })
      .catch(() => setError("We couldn't load your RSVP. Please search by name below."))
      .finally(() => setLoading(false));
  }, [searchParams]);

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

  const launchConfetti = (originX: number, originY: number) => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#8fa888", "#c4a882", "#d4736a", "#9b7ebd", "#d4a847", "#c4808a", "#ffffff"];

    type Particle = { x: number; y: number; vx: number; vy: number; color: string; w: number; h: number; rotation: number; rotSpeed: number; shape: "rect" | "circle" };
    const particles: Particle[] = [];

    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 10;
      particles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        w: 6 + Math.random() * 10,
        h: 4 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        shape: Math.random() < 0.3 ? "circle" : "rect",
      });
    }

    const totalFrames = 100;
    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      if (frame > totalFrames) return;
      const alpha = Math.max(0, 1 - frame / totalFrames);
      particles.forEach((p) => {
        p.vy += 0.4;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vx *= 0.99;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });
      confettiAnimRef.current = requestAnimationFrame(animate);
    };

    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current);
    confettiAnimRef.current = requestAnimationFrame(animate);
  };

  const handleYesClick = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
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

    if (snoreTimeoutRef.current) clearTimeout(snoreTimeoutRef.current);
    snoreTimeoutRef.current = setTimeout(stopSnore, 3000);
  };

  const stopSnore = () => {
    if (snoreTimeoutRef.current) { clearTimeout(snoreTimeoutRef.current); snoreTimeoutRef.current = null; }
    if (snoreCtxRef.current) { snoreCtxRef.current.close().catch(() => {}); snoreCtxRef.current = null; }
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
      },
    }));
    playBoing();
    setShowMaybePop(true);
    setTimeout(() => setShowMaybePop(false), 1400);
  };

  const handleNoClick = (memberId: string) => {
    setResponses((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        wedding_attending_status: "no",
        welcome_dinner_status: null,
        travel_mode: null,
        staying_late: null,
        dietary_notes: "",
        maybe_reason: "",
      },
    }));
  };

  const updateResponse = (guestId: string, field: keyof RsvpEntry, value: unknown) => {
    setResponses((prev) => ({ ...prev, [guestId]: { ...prev[guestId], [field]: value } }));
    if (field === "email") setFieldErrors((prev) => { const next = { ...prev }; delete next[guestId]; return next; });
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

  const hasExistingResponse = (result?.existingResponses?.length ?? 0) > 0;

  const hasChanges = result?.members.some((m) => {
    const prev = result?.existingResponses?.find((e) => e.guest_id === m.id);
    const curr = responses[m.id];
    if (!curr) return false;
    if (prev?.wedding_attending_status === "no") return false;
    if (!prev) {
      return !!(
        curr.wedding_attending_status ||
        curr.dietary_notes?.trim() ||
        curr.maybe_reason?.trim() ||
        curr.travel_mode ||
        curr.staying_late !== null ||
        curr.email.trim() !== (m.email ?? "") ||
        curr.cell !== (m.phone ? formatPhone(m.phone) : "")
      );
    }
    return (
      curr.wedding_attending_status !== prev.wedding_attending_status ||
      curr.welcome_dinner_status !== (prev.welcome_dinner_status ?? null) ||
      curr.maybe_reason !== (prev.maybe_reason ?? "") ||
      curr.dietary_notes !== (prev.dietary_notes ?? "") ||
      curr.travel_mode !== (prev.travel_mode ?? null) ||
      curr.staying_late !== (prev.staying_late ?? null) ||
      curr.email.trim() !== (m.email ?? "").trim() ||
      curr.cell !== (m.phone ? formatPhone(m.phone) : "")
    );
  }) ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allMembers = result?.members ?? [];
    const missingEmail = allMembers.filter((m) => {
      const existingResponse = result?.existingResponses?.find((ex) => ex.guest_id === m.id);
      const previouslyDeclined = existingResponse?.wedding_attending_status === "no";
      const currentlyNo = responses[m.id]?.wedding_attending_status === "no";
      if (previouslyDeclined || currentlyNo) return false;
      return !responses[m.id]?.email?.trim();
    });

    if (missingEmail.length > 0) {
      const names = missingEmail.map((m) => m.first_name).join(", ");
      const errors = Object.fromEntries(missingEmail.map((m) => [m.id, true]));
      setFieldErrors(errors);
      setError(`Please add an email address for: ${names}`);
      setTimeout(() => {
        document.getElementById(`email-${missingEmail[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setError(null);
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
    setGardenNames((prev) => {
      const getName = (m: typeof members[0]) =>
        [m.first_name, m.last_name].filter((p): p is string => !!p).map((p) => p[0].toUpperCase() + ".").join("");
      let yesNames = [...prev.yesNames];
      let maybeNames = [...prev.maybeNames];
      for (const m of members) {
        const name = getName(m);
        const newStatus = responses[m.id]?.wedding_attending_status;
        const prevStatus = result?.existingResponses?.find((e) => e.guest_id === m.id)?.wedding_attending_status;
        if (prevStatus === "yes") yesNames = yesNames.filter((n) => n !== name);
        if (prevStatus === "maybe") maybeNames = maybeNames.filter((n) => n !== name);
        if (newStatus === "yes") yesNames.push(name);
        if (newStatus === "maybe") maybeNames.push(name);
      }
      return { yesNames, maybeNames };
    });
    setSubmitting(false);
    setSubmitted(true);

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
      // On mobile, wait for bloom to finish before showing Peanut
      if (window.innerWidth < 640) {
        setTimeout(() => setShowPeanut(true), 4500);
      } else {
        setShowPeanut(true);
      }
    } else {
      setGardenVisible(true);
      setShowPeanut(true);
    }
  };

  const gardenProps = {
    responded: gardenCount.responded,
    newlyBloomed,
    maybe: gardenCount.maybe,
    newlySprouted,
    yesNames: gardenNames.yesNames,
    maybeNames: gardenNames.maybeNames,
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

      <canvas ref={confettiCanvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: "100vw", height: "100vh" }} />

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
              or by March 1, 2027
            </p>

            {/* Subhead */}
            <p className="font-serif italic text-xl md:text-2xl text-brown-light mt-4">
              (this really helps us)
            </p>
          </div>

          {/* ── Search form ── */}
          <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-sm p-8 relative mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs tracking-widest uppercase text-brown-light">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border border-beige-dark bg-beige px-3 py-3 text-base md:text-sm w-full rounded-xl focus:outline-none focus:border-sage pr-9"
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
                    className="border border-beige-dark bg-beige px-3 py-3 text-base md:text-sm w-full rounded-xl focus:outline-none focus:border-sage pr-9"
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
            <div className="bg-terracotta/10 border border-terracotta/40 p-4 rounded-xl mb-6">
              <p className="text-sm font-semibold text-terracotta">{error}</p>
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
                            <div
                              className="inline-flex"
                              onClick={(e) => handleYesClick(e.currentTarget as HTMLElement)}
                            >
                              <StatusButton
                                current={r?.wedding_attending_status ?? null}
                                value="yes"
                                label="Yes, I'll be there"
                                activeClass="bg-sage text-white border-sage"
                                onClick={() => updateResponse(member.id, "wedding_attending_status", "yes")}
                              />
                            </div>
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
                                onClick={() => handleNoClick(member.id)}
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
                            <p className="text-sm text-brown-light leading-relaxed bg-beige rounded-lg px-4 py-3">
                              We understand if you can&apos;t commit right away, and we&apos;ll send a few gentle reminders as the date gets closer. We would absolutely love to celebrate with you, but if your plans are uncertain, we would really appreciate as much notice as possible. Our venue is quite small, so we had to keep the guest list limited, and early updates help us make space for others we wish we could include.
                            </p>
                            <label className="text-xs tracking-widest uppercase text-brown-light">
                              Anything you&apos;d like us to know? <span className="normal-case">(optional)</span>
                            </label>
                            <textarea
                              value={r.maybe_reason}
                              onChange={(e) => updateResponse(member.id, "maybe_reason", e.target.value)}
                              className="border border-beige-dark bg-white px-3 py-2.5 text-base md:text-sm w-full rounded-lg focus:outline-none focus:border-sage resize-none"
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
                            className="border border-beige-dark bg-white px-3 py-2.5 text-base md:text-sm w-full rounded-lg focus:outline-none focus:border-sage resize-none"
                            rows={2}
                            placeholder="Allergies, dietary restrictions, etc. Leave blank if none."
                          />
                        </div>

                        </>
                        )}
                        </>
                        )}

                        {/* Contact info — always shown */}
                        <div className="flex flex-col gap-3">
                          <p className="text-xs tracking-widest uppercase text-brown-light">
                            Contact info <span className="normal-case">(so we can reach you)</span>
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex flex-col gap-1.5 flex-1">
                              <label className="text-xs text-brown-light">Email <span className="text-mauve">*</span></label>
                              <input
                                id={`email-${member.id}`}
                                type="email"
                                value={r?.email ?? ""}
                                onChange={(e) => updateResponse(member.id, "email", e.target.value)}
                                className={`border bg-white px-3 py-2.5 text-base md:text-sm w-full rounded-lg focus:outline-none focus:border-sage ${fieldErrors[member.id] ? "border-terracotta" : "border-beige-dark"}`}
                                placeholder="your@email.com"
                              />
                              {fieldErrors[member.id] && (
                                <p className="text-xs text-terracotta">Please add an email address</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                              <label className="text-xs text-brown-light">Cell</label>
                              <div className="flex items-center border border-beige-dark bg-white rounded-lg overflow-hidden focus-within:border-sage focus-within:ring-0 transition-colors">
                                <span className="px-3 py-2.5 text-sm text-brown-light bg-beige border-r border-beige-dark select-none whitespace-nowrap">+1</span>
                                <input
                                  type="tel"
                                  value={r?.cell ?? ""}
                                  onChange={(e) => updateResponse(member.id, "cell", formatPhone(e.target.value))}
                                  className="px-3 py-2.5 text-base md:text-sm w-full focus:outline-none bg-white"
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
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={submitting || (hasExistingResponse && !hasChanges)}
                className="bg-sage text-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors self-start rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving…" : hasExistingResponse ? "Update RSVP" : "Submit RSVP"}
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
