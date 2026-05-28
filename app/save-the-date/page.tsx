"use client";

import { useState } from "react";
import Image from "next/image";

type AddressFields = {
  address_line1: string;
  address_line2: string;
  address_line3: string;
  address_city: string;
  address_state: string;
  address_postal: string;
  address_country: string;
};

const EMPTY_ADDRESS: AddressFields = {
  address_line1: "",
  address_line2: "",
  address_line3: "",
  address_city: "",
  address_state: "",
  address_postal: "",
  address_country: "",
};

const COUNTRIES = ["Canada", "United States", "United Kingdom", "Germany", "Poland", "Other"];

function formatPostal(country: string, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  switch (country) {
    case "Canada": {
      const cleaned = trimmed.toUpperCase().replace(/\s+/g, "");
      if (cleaned.length === 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      return cleaned;
    }
    case "United Kingdom":
      return trimmed.toUpperCase();
    case "Poland": {
      const digits = trimmed.replace(/\D/g, "");
      if (digits.length === 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return trimmed;
    }
    case "Germany":
      return trimmed.replace(/\D/g, "");
    default:
      return trimmed;
  }
}

export default function SaveTheDatePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [partyId, setPartyId] = useState<string | null>(null);
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [address, setAddress] = useState<AddressFields>(EMPTY_ADDRESS);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const displayName = memberNames.join(" & ");

  function update(field: keyof AddressFields, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setSearchError(null);

    const res = await fetch("/api/save-the-date/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
    });

    setSearching(false);

    if (!res.ok) {
      const data = await res.json();
      if (data.error === "needs_last_name") {
        setSearchError("We found more than one guest with that first name. Please enter your last name too.");
      } else {
        setSearchError("We couldn't find your invitation. Double-check your name and try again, or reach out to us directly.");
      }
      return;
    }

    const data = await res.json();
    setPartyId(data.partyId);
    setMemberNames(data.memberNames ?? []);
    setAddress({
      address_line1: data.address.address_line1 ?? "",
      address_line2: data.address.address_line2 ?? "",
      address_line3: data.address.address_line3 ?? "",
      address_city: data.address.address_city ?? "",
      address_state: data.address.address_state ?? "",
      address_postal: data.address.address_postal ?? "",
      address_country: data.address.address_country ?? "",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const normalized: AddressFields = {
      ...address,
      address_postal: formatPostal(address.address_country, address.address_postal),
    };

    const payload: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(normalized)) {
      payload[k] = v.trim() || null;
    }

    const res = await fetch(`/api/save-the-date/${partyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      setSaveError("Something went wrong — please try again or reach out to us directly.");
      return;
    }

    setSaved(true);
  }

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto px-6 pb-64 pt-16 text-center flex flex-col items-center gap-4">
        <h1
          className="font-serif text-[5rem] md:text-[7rem] text-brown leading-none tracking-tight"
          style={{ fontWeight: 900 }}
        >
          Thanks!
        </h1>
        <p className="font-serif italic text-2xl md:text-3xl text-brown mt-1">
          Now keep an eye on your mailbox...
        </p>
        <p className="font-serif italic text-xl text-brown-light mt-2">or if you can&apos;t wait:</p>
        <a
          href="/"
          className="inline-block px-8 py-3.5 bg-sage text-white text-sm tracking-widest uppercase rounded-full hover:bg-sage-dark transition-colors font-semibold"
        >
          See Wedding Details
        </a>

        <Image
          src="/peanut/Peanut SaveTheDate.png"
          alt=""
          width={130}
          height={130}
          className="fixed bottom-0 left-1/2 pointer-events-none"
          style={{ animation: "stdate-slide-up 1s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* Hero */}
      <div className="text-center mb-4">

        {/* save the */}
        <div className="leading-none mb-0">
          <span
            className="font-serif italic text-[5rem] md:text-[8rem] text-brown leading-none tracking-tight"
            style={{ fontWeight: 700 }}
          >
            save the
          </span>
        </div>

        {/* DATE! */}
        <div className="leading-none mb-3">
          <span
            className="font-serif text-[5rem] md:text-[8rem] text-brown leading-none tracking-tight"
            style={{ fontWeight: 900 }}
          >
            DATE!
          </span>
        </div>

        {/* for */}
        <p className="font-serif italic text-xl md:text-2xl text-brown-light mb-1">for</p>

        {/* Wedding details */}
        <p className="font-serif italic text-2xl md:text-3xl text-brown mb-1">
          The Wedding of Julia &amp; Jonathan
        </p>
        <p className="font-sans text-sm tracking-[0.2em] uppercase text-brown-light mb-5">
          May 29th, 2027 · Canmore, Alberta
        </p>

        {/* Cheeky ask */}
        <p className="font-handwritten text-sage text-2xl md:text-3xl">
          and also (pretty) please give us your address:
        </p>
      </div>

      {/* Step 1: Name search */}
      {!partyId && (
        <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-sm p-8 mb-6">
          <p className="text-sm text-brown-light mb-6">Enter your name to find your party.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs tracking-widest uppercase text-brown-light">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border border-beige-dark bg-beige px-3 py-3 text-base md:text-sm w-full rounded-xl focus:outline-none focus:border-sage"
                placeholder="First name"
                required
                autoComplete="given-name"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs tracking-widest uppercase text-brown-light">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border border-beige-dark bg-beige px-3 py-3 text-base md:text-sm w-full rounded-xl focus:outline-none focus:border-sage"
                placeholder="Last name"
                autoComplete="family-name"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-sage text-white px-8 py-3.5 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors rounded-full disabled:opacity-50 font-semibold"
          >
            {searching ? "Searching…" : "Find My Party"}
          </button>
        </form>
      )}

      {searchError && (
        <div className="bg-terracotta/10 border border-terracotta/40 p-4 rounded-xl mb-6">
          <p className="text-sm font-semibold text-terracotta">{searchError}</p>
        </div>
      )}

      {/* Step 2: Address form */}
      {partyId && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-5">
          <div>
            <p className="font-serif italic text-3xl text-sage-dark">
              Found your party! 🎉
            </p>
            <p className="text-sm text-brown-light mt-0.5">{displayName}</p>
          </div>

          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">Country</span>
              <select
                value={address.address_country}
                onChange={(e) => update("address_country", e.target.value)}
                className="w-full border border-beige-dark rounded-xl px-3 py-3 text-base md:text-sm bg-white focus:outline-none focus:border-sage"
              >
                <option value="">Select…</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Address <span className="text-terracotta normal-case font-normal">*</span>
              </span>
              <input
                type="text"
                value={address.address_line1}
                onChange={(e) => update("address_line1", e.target.value)}
                placeholder="Street address"
                required
                autoComplete="address-line1"
                className="w-full border border-beige-dark bg-beige rounded-xl px-3 py-3 text-base md:text-sm focus:outline-none focus:border-sage"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Address 2 <span className="normal-case font-normal text-brown-light/60">(optional)</span>
              </span>
              <input
                type="text"
                value={address.address_line2}
                onChange={(e) => update("address_line2", e.target.value)}
                placeholder="Apt, Suite, Unit, etc."
                autoComplete="address-line2"
                className="w-full border border-beige-dark bg-beige rounded-xl px-3 py-3 text-base md:text-sm focus:outline-none focus:border-sage"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Address 3 <span className="normal-case font-normal text-brown-light/60">(optional)</span>
              </span>
              <input
                type="text"
                value={address.address_line3}
                onChange={(e) => update("address_line3", e.target.value)}
                placeholder="Building, c/o, etc."
                className="w-full border border-beige-dark bg-beige rounded-xl px-3 py-3 text-base md:text-sm focus:outline-none focus:border-sage"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">City</span>
                <input
                  type="text"
                  value={address.address_city}
                  onChange={(e) => update("address_city", e.target.value)}
                  autoComplete="address-level2"
                  className="w-full border border-beige-dark bg-beige rounded-xl px-3 py-3 text-base md:text-sm focus:outline-none focus:border-sage"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">State / Province</span>
                <input
                  type="text"
                  value={address.address_state}
                  onChange={(e) => update("address_state", e.target.value)}
                  autoComplete="address-level1"
                  className="w-full border border-beige-dark bg-beige rounded-xl px-3 py-3 text-base md:text-sm focus:outline-none focus:border-sage"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">Postal / Zip</span>
              <input
                type="text"
                value={address.address_postal}
                onChange={(e) => update("address_postal", e.target.value)}
                onBlur={(e) => update("address_postal", formatPostal(address.address_country, e.target.value))}
                autoComplete="postal-code"
                className="w-full border border-beige-dark bg-beige rounded-xl px-3 py-3 text-base md:text-sm focus:outline-none focus:border-sage"
              />
            </label>
          </div>

          {saveError && (
            <div className="bg-terracotta/10 border border-terracotta/40 p-4 rounded-xl">
              <p className="text-sm font-semibold text-terracotta">{saveError}</p>
            </div>
          )}

          <div className="flex gap-5 items-center flex-wrap">
            <button
              type="submit"
              disabled={saving}
              className="bg-sage text-white px-8 py-3.5 text-sm tracking-widest uppercase hover:bg-sage-dark transition-colors rounded-full disabled:opacity-50 font-semibold"
            >
              {saving ? "Saving…" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => { setPartyId(null); setSearchError(null); }}
              className="text-sm text-brown-light hover:text-brown transition-colors"
            >
              Not you? Search again
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
