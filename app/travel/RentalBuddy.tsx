"use client";

import { useState, useCallback } from "react";

type Guest = { id: string; first_name: string; last_name: string | null; email: string | null };

type PlanForm = {
  arrival_airport: string;
  arrival_date: string;
  arrival_time: string;
  departure_airport: string;
  departure_date: string;
  departure_time: string;
  share_intent: "" | "needs_seat" | "has_car" | "flexible";
  share_scope: "" | "whole_trip" | "airport_only" | "either";
  note: string;
  email: string;
};

type BoardPlan = {
  id: string;
  guest_id: string;
  first_name: string;
  arrival_airport: string;
  arrival_date: string;
  arrival_time: string | null;
  departure_airport: string;
  departure_date: string | null;
  departure_time: string | null;
  share_intent: string;
  share_scope: string;
  note: string | null;
};

const INTENT_LABEL: Record<string, string> = {
  needs_seat: "Needs a seat",
  has_car: "Has a car, room to share",
  flexible: "Flexible",
};

const SCOPE_LABEL: Record<string, string> = {
  whole_trip: "Whole trip",
  airport_only: "Airport ride only",
  either: "Either works",
};

const EMPTY_FORM: PlanForm = {
  arrival_airport: "YYC",
  arrival_date: "",
  arrival_time: "",
  departure_airport: "YYC",
  departure_date: "",
  departure_time: "",
  share_intent: "",
  share_scope: "",
  note: "",
  email: "",
};

function formatDate(date: string | null): string {
  if (!date) return "";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const inputClass =
  "w-full border border-beige-dark bg-beige rounded-xl px-3 py-3 text-base sm:text-sm focus:outline-none focus:border-sage";
const labelClass = "block text-xs font-medium text-brown-light uppercase tracking-wider mb-1";

export default function RentalBuddy() {
  // identity
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);

  // plan form
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);
  const [hasPlan, setHasPlan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // board
  const [board, setBoard] = useState<BoardPlan[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<Record<string, boolean>>({});

  const loadBoard = useCallback(async () => {
    const res = await fetch("/api/travel/plans");
    if (res.ok) {
      const data = await res.json();
      setBoard(data.plans ?? []);
    }
  }, []);

  function set<K extends keyof PlanForm>(field: K, value: PlanForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setSearchError(null);

    const res = await fetch("/api/travel/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
    });
    setSearching(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSearchError(
        data.error === "needs_last_name"
          ? "More than one guest has that first name. Please add your last name."
          : "We couldn't find you on the guest list. Double-check your name, or reach out to us directly."
      );
      return;
    }

    const data = await res.json();
    setGuest(data.guest);
    if (data.plan) {
      setHasPlan(true);
      setForm({
        arrival_airport: data.plan.arrival_airport ?? "YYC",
        arrival_date: data.plan.arrival_date ?? "",
        arrival_time: data.plan.arrival_time ?? "",
        departure_airport: data.plan.departure_airport ?? "YYC",
        departure_date: data.plan.departure_date ?? "",
        departure_time: data.plan.departure_time ?? "",
        share_intent: data.plan.share_intent ?? "",
        share_scope: data.plan.share_scope ?? "",
        note: data.plan.note ?? "",
        email: data.guest.email ?? "",
      });
    } else {
      setForm({ ...EMPTY_FORM, email: data.guest.email ?? "" });
    }
    loadBoard();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!guest) return;
    setSaving(true);
    setSaveError(null);

    const res = await fetch("/api/travel/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: guest.id, ...form }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSaveError(
        data.error === "email_required"
          ? "Please add an email so a match can reach you."
          : data.error === "arrival_date_required"
          ? "Please add your arrival date."
          : "Something went wrong. Please try again."
      );
      return;
    }

    setHasPlan(true);
    setGuest({ ...guest, email: form.email });
    loadBoard();
  }

  async function handleRemove() {
    if (!guest) return;
    await fetch(`/api/travel/plans?guestId=${guest.id}`, { method: "DELETE" });
    setHasPlan(false);
    setForm({ ...EMPTY_FORM, email: guest.email ?? "" });
    loadBoard();
  }

  async function handleConnect(toGuestId: string) {
    if (!guest) return;
    setConnectingId(toGuestId);
    const res = await fetch("/api/travel/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromGuestId: guest.id, toGuestId }),
    });
    setConnectingId(null);
    if (res.ok) setSentTo((prev) => ({ ...prev, [toGuestId]: true }));
  }

  // ---- step 1: name search ----
  if (!guest) {
    return (
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm px-6 py-6">
        <p className="font-serif text-xl text-brown">Find a rental buddy</p>
        <p className="font-sans text-brown-light text-base sm:text-sm mt-2 leading-relaxed">
          Flying in and open to splitting a rental car? Add your travel dates and see other guests
          arriving around the same time. Enter your name to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            required
            autoComplete="given-name"
            className={inputClass}
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
        {searchError && <p className="text-sm font-semibold text-terracotta mt-3">{searchError}</p>}
        <button
          type="submit"
          disabled={searching}
          className="mt-4 bg-sage text-white px-7 py-3 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors rounded-full disabled:opacity-50 font-semibold"
        >
          {searching ? "Searching…" : "Get started"}
        </button>
      </form>
    );
  }

  // ---- step 2: plan form + board ----
  return (
    <div className="flex flex-col gap-4">
      {/* Plan form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm px-6 py-6 flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="font-serif text-xl text-brown">
            {hasPlan ? "Your travel plans" : `Hi ${guest.first_name}! Add your travel plans`}
          </p>
          <button
            type="button"
            onClick={() => { setGuest(null); setHasPlan(false); }}
            className="text-xs text-brown-light hover:text-brown underline underline-offset-2"
          >
            Not you?
          </button>
        </div>

        {/* Arrival */}
        <div>
          <p className="font-sans uppercase tracking-widest text-brown font-bold text-[0.65rem] mb-2">Arrival</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Date <span className="text-terracotta">*</span></span>
              <input type="date" required value={form.arrival_date} onChange={(e) => set("arrival_date", e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Time <span className="normal-case text-brown-light/60">(optional)</span></span>
              <input type="text" value={form.arrival_time} onChange={(e) => set("arrival_time", e.target.value)} placeholder="2:40 PM" className={inputClass} />
            </label>
          </div>
          <label className="block mt-3">
            <span className={labelClass}>Airport</span>
            <input type="text" value={form.arrival_airport} onChange={(e) => set("arrival_airport", e.target.value)} placeholder="YYC" className={inputClass} />
          </label>
        </div>

        {/* Departure */}
        <div>
          <p className="font-sans uppercase tracking-widest text-brown font-bold text-[0.65rem] mb-2">Departure <span className="normal-case font-normal text-brown-light/60">(optional)</span></p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Date</span>
              <input type="date" value={form.departure_date} onChange={(e) => set("departure_date", e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Time</span>
              <input type="text" value={form.departure_time} onChange={(e) => set("departure_time", e.target.value)} placeholder="11:00 AM" className={inputClass} />
            </label>
          </div>
        </div>

        {/* Intent + scope */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>I&apos;m looking to</span>
            <select required value={form.share_intent} onChange={(e) => set("share_intent", e.target.value as PlanForm["share_intent"])} className={inputClass}>
              <option value="" disabled>Select…</option>
              <option value="needs_seat">Find a seat in someone&apos;s car</option>
              <option value="has_car">Offer seats (I&apos;ll have a car)</option>
              <option value="flexible">Flexible, let&apos;s figure it out</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Share for</span>
            <select required value={form.share_scope} onChange={(e) => set("share_scope", e.target.value as PlanForm["share_scope"])} className={inputClass}>
              <option value="" disabled>Select…</option>
              <option value="whole_trip">The whole trip</option>
              <option value="airport_only">Just the airport ride</option>
              <option value="either">Either works</option>
            </select>
          </label>
        </div>

        {/* Email */}
        <label className="block">
          <span className={labelClass}>Email <span className="text-terracotta">*</span></span>
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" autoComplete="email" className={inputClass} />
          <span className="block text-xs text-brown-light/70 mt-1">Only shared if you reach out to someone, or if a match contacts you.</span>
        </label>

        {/* Note */}
        <label className="block">
          <span className={labelClass}>Note <span className="normal-case text-brown-light/60">(optional)</span></span>
          <textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} placeholder="Staying at Mountain View Inn, have room for 2…" className={inputClass} />
        </label>

        {saveError && <p className="text-sm font-semibold text-terracotta">{saveError}</p>}

        <div className="flex items-center gap-5 flex-wrap">
          <button type="submit" disabled={saving} className="bg-sage text-white px-7 py-3 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors rounded-full disabled:opacity-50 font-semibold">
            {saving ? "Saving…" : hasPlan ? "Update my plans" : "Add me to the board"}
          </button>
          {hasPlan && (
            <button type="button" onClick={handleRemove} className="text-sm text-brown-light hover:text-terracotta transition-colors">
              Remove my plans
            </button>
          )}
        </div>
      </form>

      {/* Board */}
      <div className="bg-white rounded-2xl shadow-sm px-6 py-6">
        <p className="font-serif text-xl text-brown">Other guests flying in</p>
        {!hasPlan && (
          <p className="font-sans text-brown-light text-base sm:text-sm mt-2 leading-relaxed">
            Add your own plans above to unlock the Connect button.
          </p>
        )}
        {board.filter((p) => p.guest_id !== guest.id).length === 0 ? (
          <p className="font-sans text-brown-light text-base sm:text-sm mt-2 leading-relaxed">
            No one else has shared plans yet. Check back as more guests RSVP.
          </p>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {board
              .filter((p) => p.guest_id !== guest.id)
              .map((p) => (
                <div key={p.id} className="rounded-xl bg-beige px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <p className="font-serif text-base text-brown">{p.first_name}</p>
                    <span className="text-[0.65rem] uppercase tracking-widest font-bold text-sage-dark">{INTENT_LABEL[p.share_intent]}</span>
                  </div>
                  <p className="font-sans text-sm text-brown-light mt-1 leading-relaxed">
                    Arrives {formatDate(p.arrival_date)}{p.arrival_time ? ` · ${p.arrival_time}` : ""} into {p.arrival_airport}
                    {p.departure_date ? ` · leaves ${formatDate(p.departure_date)}` : ""}
                  </p>
                  <p className="font-sans text-xs text-brown-light/80 mt-0.5">{SCOPE_LABEL[p.share_scope]}</p>
                  {p.note && <p className="font-sans text-sm text-brown mt-1 italic">“{p.note}”</p>}
                  <div className="mt-2">
                    {sentTo[p.guest_id] ? (
                      <span className="font-sans text-sm text-sage-dark font-medium">✓ Email sent to {p.first_name}</span>
                    ) : (
                      <button
                        type="button"
                        disabled={!hasPlan || connectingId === p.guest_id}
                        onClick={() => handleConnect(p.guest_id)}
                        className="font-sans text-sm text-sage-dark hover:text-sage underline underline-offset-2 disabled:opacity-40 disabled:no-underline"
                        title={!hasPlan ? "Add your own plans first" : `We'll email ${p.first_name} and share your name + email`}
                      >
                        {connectingId === p.guest_id ? "Sending…" : `Connect with ${p.first_name} →`}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
