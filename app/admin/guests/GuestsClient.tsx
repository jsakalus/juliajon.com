'use client';

import { useState, useMemo } from 'react';
import AddressModal, { AddressFields } from './AddressModal';

export type Guest = {
  id: string;
  party_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};

export type Party = AddressFields & {
  id: string;
  name: string;
  list_tier: 'A' | 'B' | 'C' | null;
  invited_to_welcome_dinner: boolean;
  invite_mailed: boolean;
  guests: Guest[];
};

function formatAddress(p: AddressFields): string {
  const lines = [
    p.address_line1,
    p.address_line2,
    p.address_line3,
    [p.address_city, p.address_state, p.address_postal].filter(Boolean).join(' '),
    p.address_country,
  ]
    .map(s => (s ? s.trim() : ''))
    .filter(s => s.length > 0);
  return lines.join(', ');
}

function hasAddress(p: AddressFields): boolean {
  return !!(
    p.address_line1 ||
    p.address_line2 ||
    p.address_line3 ||
    p.address_city ||
    p.address_state ||
    p.address_postal ||
    p.address_country
  );
}

function TierBadge({ value, onChange }: {
  value: 'A' | 'B' | 'C' | null;
  onChange: (v: 'A' | 'B' | 'C') => void;
}) {
  const tierColor = value === 'A' ? 'bg-sage text-white' : value === 'B' ? 'bg-gold text-white' : 'bg-brown-light/20 text-brown';
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value as 'A' | 'B' | 'C')}
      className={`text-xs font-medium px-2 py-1 rounded-full ${tierColor} border-0 focus:outline-none focus:ring-2 focus:ring-sage cursor-pointer`}
    >
      {!value && <option value="" disabled>?</option>}
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
    </select>
  );
}

function InlineInput({ value, onSave, placeholder, className = '' }: {
  value: string | null;
  onSave: (v: string | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value ?? '');
  function commit() {
    const next = local.trim();
    const cleaned = next === '' ? null : next;
    if (cleaned !== value) onSave(cleaned);
  }
  return (
    <input
      type="text"
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') {
          setLocal(value ?? '');
          (e.target as HTMLInputElement).blur();
        }
      }}
      placeholder={placeholder}
      className={`bg-transparent border border-transparent hover:border-beige-dark focus:border-sage focus:bg-white rounded px-1.5 py-0.5 focus:outline-none ${className}`}
    />
  );
}

function PartyCard({
  party,
  onUpdateParty,
  onUpdateGuest,
  onEditAddress,
}: {
  party: Party;
  onUpdateParty: (updates: Partial<Party>) => void;
  onUpdateGuest: (guestId: string, updates: Partial<Guest>) => void;
  onEditAddress: () => void;
}) {
  const addressText = formatAddress(party);
  const partyHasAddress = hasAddress(party);

  return (
    <div className="bg-white border border-beige-dark rounded-xl shadow-sm px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <InlineInput
            value={party.name}
            onSave={v => v && onUpdateParty({ name: v })}
            className="font-serif text-base text-brown w-full"
          />
        </div>
        <TierBadge
          value={party.list_tier}
          onChange={v => onUpdateParty({ list_tier: v })}
        />
      </div>

      <div className="space-y-0.5 mb-2">
        {party.guests.map(g => (
          <div key={g.id} className="flex gap-2 text-sm text-brown items-center">
            <InlineInput
              value={g.first_name}
              onSave={v => v && onUpdateGuest(g.id, { first_name: v })}
              placeholder="First"
              className="flex-1"
            />
            <InlineInput
              value={g.last_name}
              onSave={v => onUpdateGuest(g.id, { last_name: v })}
              placeholder="Last"
              className="flex-1"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2 border-t border-beige">
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={party.invited_to_welcome_dinner}
              onChange={e => onUpdateParty({ invited_to_welcome_dinner: e.target.checked })}
              className="rounded border-beige-dark text-sage focus:ring-sage"
            />
            <span className="text-brown">Dinner</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={party.invite_mailed}
              onChange={e => onUpdateParty({ invite_mailed: e.target.checked })}
              className="rounded border-beige-dark text-sage focus:ring-sage"
            />
            <span className="text-brown">Mailed</span>
          </label>
        </div>
        <button
          onClick={onEditAddress}
          className="text-sm font-medium px-3 py-1 rounded-lg border border-sage text-sage hover:bg-sage hover:text-white transition-colors"
        >
          {partyHasAddress ? 'Edit address' : '+ Add address'}
        </button>
      </div>

      {partyHasAddress && (
        <p className="text-xs text-brown-light mt-1.5 truncate">📍 {addressText}</p>
      )}
    </div>
  );
}

const TIER_FILTERS = ['All', 'A', 'B', 'C'] as const;
type TierFilter = (typeof TIER_FILTERS)[number];

export default function GuestsClient({ initialParties }: { initialParties: Party[] }) {
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('All');
  const [editingAddressFor, setEditingAddressFor] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parties.filter(p => {
      if (tierFilter !== 'All' && p.list_tier !== tierFilter) return false;
      if (!q) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      return p.guests.some(g => {
        const full = `${g.first_name} ${g.last_name ?? ''}`.toLowerCase();
        return full.includes(q);
      });
    });
  }, [parties, search, tierFilter]);

  const stats = useMemo(() => {
    const totalGuests = filtered.reduce((sum, p) => sum + p.guests.length, 0);
    const mailed = filtered.filter(p => p.invite_mailed).length;
    return { totalParties: filtered.length, totalGuests, mailed };
  }, [filtered]);

  function updatePartyLocal(id: string, updates: Partial<Party>) {
    setParties(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }

  async function updateParty(id: string, updates: Partial<Party>) {
    const prev = parties.find(p => p.id === id);
    updatePartyLocal(id, updates);
    const res = await fetch(`/api/admin/guests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok && prev) {
      // revert on failure
      updatePartyLocal(id, prev);
      const data = await res.json().catch(() => ({}));
      alert(`Save failed: ${data.error ?? res.statusText}`);
    }
  }

  async function updateGuest(partyId: string, guestId: string, updates: Partial<Guest>) {
    const prev = parties.find(p => p.id === partyId)?.guests.find(g => g.id === guestId);
    setParties(p =>
      p.map(party =>
        party.id === partyId
          ? {
              ...party,
              guests: party.guests.map(g => (g.id === guestId ? { ...g, ...updates } : g)),
            }
          : party
      )
    );
    const res = await fetch(`/api/admin/guest/${guestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok && prev) {
      setParties(p =>
        p.map(party =>
          party.id === partyId
            ? {
                ...party,
                guests: party.guests.map(g => (g.id === guestId ? prev : g)),
              }
            : party
        )
      );
      const data = await res.json().catch(() => ({}));
      alert(`Save failed: ${data.error ?? res.statusText}`);
    }
  }

  const editingParty = parties.find(p => p.id === editingAddressFor) ?? null;

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-serif text-2xl sm:text-3xl text-brown">Guests</h1>
        <p className="text-sm text-brown-light mt-1">
          {tierFilter !== 'All' && <span className="font-medium text-brown">Tier {tierFilter}: </span>}
          {stats.totalParties} parties · {stats.totalGuests} guests · {stats.mailed} invites mailed
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {TIER_FILTERS.map(t => {
          const active = tierFilter === t;
          return (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                active
                  ? 'bg-brown text-beige'
                  : 'bg-white border border-beige-dark text-brown hover:border-brown'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by party or guest name…"
          className="flex-1 border border-beige-dark rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage"
        />
        <a
          href="/api/admin/guests/export"
          className="bg-sage text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sage-dark text-center"
        >
          Export CSV ↓
        </a>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-brown-light text-center py-8">No parties match your search.</p>
        ) : (
          filtered.map(party => (
            <PartyCard
              key={party.id}
              party={party}
              onUpdateParty={updates => updateParty(party.id, updates)}
              onUpdateGuest={(guestId, updates) => updateGuest(party.id, guestId, updates)}
              onEditAddress={() => setEditingAddressFor(party.id)}
            />
          ))
        )}
      </div>

      {editingParty && (
        <AddressModal
          partyName={editingParty.name}
          initial={{
            address_line1: editingParty.address_line1,
            address_line2: editingParty.address_line2,
            address_line3: editingParty.address_line3,
            address_city: editingParty.address_city,
            address_state: editingParty.address_state,
            address_postal: editingParty.address_postal,
            address_country: editingParty.address_country,
          }}
          onClose={() => setEditingAddressFor(null)}
          onSave={async fields => {
            await updateParty(editingParty.id, fields);
            setEditingAddressFor(null);
          }}
        />
      )}
    </div>
  );
}
