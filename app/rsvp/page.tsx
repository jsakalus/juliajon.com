"use client";

import { useState, useEffect } from "react";
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
}: {
  responded: number;
  newlyBloomed: number;
}) {
  if (responded === 0) return null;

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
              key={i}
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
      </div>
      <p className="font-handwritten text-sage text-xl mt-5">
        thank you to everyone who&apos;s already replied!
      </p>
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
  const [gardenCount, setGardenCount] = useState({ responded: 0, total: 0 });
  const [newlyBloomed, setNewlyBloomed] = useState(0);
  const [blooming, setBlooming] = useState(false);
  const [bloomFlowers, setBloomFlowers] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/rsvp/count", { cache: "no-store" })
      .then((r) => r.json())
      .then(setGardenCount)
      .catch(() => {});
  }, []);

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
        cell: member.phone ?? "",
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

    const yesCount = result?.members.filter((m) => {
      const wasAlreadyYes = result.existingResponses?.find(
        (e) => e.guest_id === m.id
      )?.wedding_attending_status === "yes";
      return responses[m.id]?.wedding_attending_status === "yes" && !wasAlreadyYes;
    }).length ?? 0;

    const prevResponded = gardenCount.responded;
    const myFlowers = Array.from({ length: yesCount }, (_, i) =>
      BLOOMED_FLOWERS[(prevResponded + i) % BLOOMED_FLOWERS.length]
    );

    setBloomFlowers(myFlowers);
    setNewlyBloomed(yesCount);
    setGardenCount((prev) => ({ ...prev, responded: prev.responded + yesCount }));
    setSubmitting(false);
    setSubmitted(true);
    setShowPeanut(true);

    if (yesCount > 0) {
      setBlooming(true);
      setTimeout(() => setBlooming(false), 2800);
    }
  };

  const garden = (
    <FlowerGarden
      responded={gardenCount.responded}
      newlyBloomed={newlyBloomed}
    />
  );

  const bloomOverlay = blooming && bloomFlowers.length > 0 && (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none pb-6 gap-1">
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
        className="font-handwritten text-sage text-2xl"
        style={{
          animation: "flower-bloom-big 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          animationDelay: `${bloomFlowers.length * 0.3}s`,
        }}
      >
        your flower just bloomed!
      </p>
    </div>
  );

  if (submitted) {
    return (
      <>
        {showPeanut && <PeanutCelebration onDismiss={() => setShowPeanut(false)} />}
        {bloomOverlay}
        <div className="max-w-2xl mx-auto px-6 py-16">
          {garden}
        </div>
      </>
    );
  }

  return (
    <>
      {showPeanut && <PeanutCelebration onDismiss={() => setShowPeanut(false)} />}

      <div className="relative overflow-x-hidden">
        {/* Flower border images */}
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

        <div className="max-w-2xl mx-auto px-6">

          {/* ── Hero ── */}
          <div className="text-center pt-12 pb-8 relative">

            {/* "Please RSVP" */}
            <div className="flex items-end justify-center gap-3 md:gap-5 mb-1">
              <span
                className="font-serif italic text-xl md:text-2xl text-brown font-normal pb-2 inline-block"
                style={{ animation: "please-bounce 2s ease-in-out infinite" }}
              >
                Please
              </span>
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
                              onClick={() => updateResponse(member.id, "wedding_attending_status", "yes")}
                            />
                            <StatusButton
                              current={r?.wedding_attending_status ?? null}
                              value="maybe"
                              label="Maybe"
                              activeClass="bg-gold text-white border-gold"
                              onClick={() => updateResponse(member.id, "wedding_attending_status", "maybe")}
                            />
                            <StatusButton
                              current={r?.wedding_attending_status ?? null}
                              value="no"
                              label="Regretfully, no"
                              activeClass="bg-mauve text-white border-mauve"
                              onClick={() => updateResponse(member.id, "wedding_attending_status", "no")}
                            />
                          </div>
                          {currentlySelectingNo && (
                            <p className="text-xs text-brown-light mt-1 leading-relaxed">
                              Heads up — once you submit a &quot;no,&quot; we won&apos;t be able to change it here. If anything shifts, reach out to us directly.
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
                                onClick={() => updateResponse(member.id, "welcome_dinner_status", "yes")}
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
                              onClick={() => updateResponse(member.id, "travel_mode", "flying_booked")}
                            />
                            <StatusButton
                              current={r?.travel_mode ?? null}
                              value="flying_not_booked"
                              label="Not yet"
                              activeClass="bg-brown-light text-white border-brown-light"
                              onClick={() => updateResponse(member.id, "travel_mode", "flying_not_booked")}
                            />
                            <StatusButton
                              current={r?.travel_mode ?? null}
                              value="driving"
                              label="I'm driving"
                              activeClass="bg-terracotta text-white border-terracotta"
                              onClick={() => updateResponse(member.id, "travel_mode", "driving")}
                            />
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
                              onClick={() => updateResponse(member.id, "staying_late", true)}
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
                              <input
                                type="tel"
                                value={r?.cell ?? ""}
                                onChange={(e) => updateResponse(member.id, "cell", e.target.value)}
                                className="border border-beige-dark bg-white px-3 py-2.5 text-sm w-full rounded-lg focus:outline-none focus:border-sage"
                                placeholder="+1 (555) 000-0000"
                              />
                            </div>
                          </div>
                        </div>
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
