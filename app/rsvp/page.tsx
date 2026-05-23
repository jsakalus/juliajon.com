"use client";

import { useState } from "react";

type Guest = { id: string; first_name: string; last_name: string | null };
type Party = { id: string; name: string; invited_to_welcome_dinner: boolean };
type RsvpEntry = {
  guest_id: string;
  wedding_attending: boolean | null;
  welcome_dinner_attending: boolean | null;
  dietary_notes: string;
};
type SearchResult = {
  party: Party;
  members: Guest[];
  existingResponses: RsvpEntry[];
};

type AttendanceButtonProps = {
  selected: boolean | null;
  value: boolean;
  label: string;
  activeClass: string;
  onClick: () => void;
};

function AttendanceButton({ selected, value, label, activeClass, onClick }: AttendanceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm border transition-colors ${
        selected === value ? activeClass : "border-beige-dark text-brown-light hover:border-sage"
      }`}
    >
      {label}
    </button>
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
        wedding_attending: existing?.wedding_attending ?? null,
        welcome_dinner_attending: existing?.welcome_dinner_attending ?? null,
        dietary_notes: existing?.dietary_notes ?? "",
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

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center flex flex-col gap-4">
        <p className="font-serif italic text-5xl text-brown">Thank you!</p>
        <p className="text-brown-light leading-relaxed">
          Your RSVP has been received. We can't wait to celebrate with you in Canmore.
        </p>
        <button onClick={() => { setSubmitted(false); setResult(null); setFirstName(""); setLastName(""); }}
          className="text-sm text-sage underline mt-4">
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16 flex flex-col gap-8">

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-mauve font-semibold">You're invited</p>
        <h1 className="font-serif italic text-4xl text-brown font-light">RSVP</h1>
        <p className="font-sans text-brown mt-1">
          Please RSVP by March 1, 2027. Enter your name and we'll find your invitation.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex flex-col gap-5 bg-white p-8">
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs tracking-widest uppercase text-brown-light">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-beige-dark bg-beige px-3 py-2.5 text-sm w-full focus:outline-none focus:border-sage"
              placeholder="First name"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs tracking-widest uppercase text-brown-light">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-beige-dark bg-beige px-3 py-2.5 text-sm w-full focus:outline-none focus:border-sage"
              placeholder="Last name"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-sage text-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors self-start disabled:opacity-50"
        >
          {loading ? "Searching…" : "Find My Invitation"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-white p-6 border-l-4 border-l-mauve">
          <p className="text-sm text-brown-light">{error}</p>
        </div>
      )}

      {/* RSVP form */}
      {result && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <p className="text-xs tracking-widest uppercase text-sage-dark mb-1">Found your invitation</p>
            <p className="font-serif text-2xl text-brown">{result.party.name}</p>
          </div>

          {result.members.map((member) => (
            <div key={member.id} className="bg-white p-6 flex flex-col gap-5">
              <p className="font-serif text-xl text-brown">
                {member.first_name}{member.last_name ? ` ${member.last_name}` : ""}
              </p>

              <div className="flex flex-col gap-2">
                <p className="text-xs tracking-widest uppercase text-brown-light">Attending the wedding?</p>
                <div className="flex gap-3 flex-wrap">
                  <AttendanceButton selected={responses[member.id]?.wedding_attending ?? null} value={true}
                    label="Yes, I'll be there" activeClass="bg-sage text-white border-sage" onClick={() => updateResponse(member.id, "wedding_attending", true)} />
                  <AttendanceButton selected={responses[member.id]?.wedding_attending ?? null} value={false}
                    label="Regretfully, no" activeClass="bg-mauve text-white border-mauve" onClick={() => updateResponse(member.id, "wedding_attending", false)} />
                </div>
              </div>

              {result.party.invited_to_welcome_dinner && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs tracking-widest uppercase text-brown-light">
                    Attending the welcome dinner? <span className="normal-case">(Friday, May 28)</span>
                  </p>
                  <div className="flex gap-3">
                    <AttendanceButton selected={responses[member.id]?.welcome_dinner_attending ?? null} value={true}
                      label="Yes" activeClass="bg-gold text-white border-gold" onClick={() => updateResponse(member.id, "welcome_dinner_attending", true)} />
                    <AttendanceButton selected={responses[member.id]?.welcome_dinner_attending ?? null} value={false}
                      label="No" activeClass="bg-mauve text-white border-mauve" onClick={() => updateResponse(member.id, "welcome_dinner_attending", false)} />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-widest uppercase text-brown-light">Dietary notes</label>
                <textarea
                  value={responses[member.id]?.dietary_notes ?? ""}
                  onChange={(e) => updateResponse(member.id, "dietary_notes", e.target.value)}
                  className="border border-beige-dark bg-beige px-3 py-2.5 text-sm w-full focus:outline-none focus:border-sage resize-none"
                  rows={2}
                  placeholder="Allergies, dietary restrictions, etc. Leave blank if none."
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="bg-sage text-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors self-start disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit RSVP"}
          </button>
        </form>
      )}

    </div>
  );
}
