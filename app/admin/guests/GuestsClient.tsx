'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTierFilter } from '@/lib/adminTier';
import TierBar from '../components/TierBar';
import AddressModal, { AddressFields } from './AddressModal';

export type Guest = {
  id: string;
  party_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  rsvp_status: string | null;
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

function InlineInput({ value, onSave, placeholder, className = '', highlight = false }: {
  value: string | null;
  onSave: (v: string | null) => void;
  placeholder?: string;
  className?: string;
  highlight?: boolean;
}) {
  const [local, setLocal] = useState(value ?? '');
  useEffect(() => {
    setLocal(value ?? '');
  }, [value]);
  function commit() {
    const next = local.trim();
    const cleaned = next === '' ? null : next;
    if (cleaned !== value) onSave(cleaned);
  }
  const borderClass = highlight
    ? 'border border-mauve/60 bg-mauve/10 placeholder-mauve'
    : 'border border-transparent';
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
      className={`bg-transparent ${borderClass} hover:border-beige-dark focus:border-sage focus:bg-white rounded px-1.5 py-0.5 focus:outline-none ${className}`}
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
              placeholder="Last (missing)"
              className="flex-1"
              highlight={!g.last_name}
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
          className={
            partyHasAddress
              ? 'text-sm font-medium px-3 py-1 rounded-lg border border-sage text-sage hover:bg-sage hover:text-white transition-colors'
              : 'text-sm font-medium px-3 py-1 rounded-lg bg-mauve text-white hover:opacity-90 transition-opacity'
          }
        >
          {partyHasAddress ? 'Edit address' : '+ Add address'}
        </button>
      </div>

      {partyHasAddress && (
        <p className="text-sm text-brown mt-2 leading-snug">📍 {addressText}</p>
      )}
    </div>
  );
}

export default function GuestsClient({ initialParties }: { initialParties: Party[] }) {
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [search, setSearch] = useState('');
  const [tierFilter] = useTierFilter();
  const [hideNos, setHideNos] = useState(false);
  const [editingAddressFor, setEditingAddressFor] = useState<string | null>(null);

  const dinnerCheckboxRef = useRef<HTMLInputElement>(null);
  const mailedCheckboxRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parties.filter(p => {
      if (tierFilter !== 'All' && p.list_tier !== tierFilter) return false;
      if (hideNos && p.guests.length > 0 && p.guests.every(g => g.rsvp_status === 'no')) {
        return false;
      }
      if (!q) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      return p.guests.some(g => {
        const full = `${g.first_name} ${g.last_name ?? ''}`.toLowerCase();
        return full.includes(q);
      });
    });
  }, [parties, search, tierFilter, hideNos]);

  const stats = useMemo(() => {
    const totalGuests = filtered.reduce((sum, p) => sum + p.guests.length, 0);
    const mailed = filtered.filter(p => p.invite_mailed).length;
    return { totalParties: filtered.length, totalGuests, mailed };
  }, [filtered]);

  const bulk = useMemo(() => {
    const dinnerOn = filtered.filter(p => p.invited_to_welcome_dinner).length;
    const mailedOn = filtered.filter(p => p.invite_mailed).length;
    return {
      dinnerAll: filtered.length > 0 && dinnerOn === filtered.length,
      dinnerSome: dinnerOn > 0 && dinnerOn < filtered.length,
      mailedAll: filtered.length > 0 && mailedOn === filtered.length,
      mailedSome: mailedOn > 0 && mailedOn < filtered.length,
    };
  }, [filtered]);

  useEffect(() => {
    if (dinnerCheckboxRef.current) dinnerCheckboxRef.current.indeterminate = bulk.dinnerSome;
    if (mailedCheckboxRef.current) mailedCheckboxRef.current.indeterminate = bulk.mailedSome;
  }, [bulk.dinnerSome, bulk.mailedSome]);

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

  async function bulkUpdate(field: 'invited_to_welcome_dinner' | 'invite_mailed', value: boolean) {
    if (filtered.length === 0) return;
    const targetIds = filtered.filter(p => p[field] !== value).map(p => p.id);
    if (targetIds.length === 0) return;
    // Optimistic update
    const prev = parties;
    setParties(ps => ps.map(p => (targetIds.includes(p.id) ? { ...p, [field]: value } : p)));
    const res = await fetch('/api/admin/guests/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyIds: targetIds, updates: { [field]: value } }),
    });
    if (!res.ok) {
      setParties(prev);
      const data = await res.json().catch(() => ({}));
      alert(`Bulk update failed: ${data.error ?? res.statusText}`);
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
        <h1 className="font-serif text-2xl sm:text-3xl text-brown">
          Guests
          {tierFilter !== 'All' && <span className="text-base sm:text-lg text-brown-light"> · Tier {tierFilter}</span>}
        </h1>
        <p className="text-sm text-brown-light mt-1">
          {stats.totalParties} parties · {stats.totalGuests} guests · {stats.mailed} invites mailed
        </p>
        <TierBar className="mt-3" />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 mb-3">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideNos}
            onChange={e => setHideNos(e.target.checked)}
            className="rounded border-beige-dark text-sage focus:ring-sage"
          />
          <span className="text-brown">Hide RSVP no&apos;s</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by party or guest name…"
          className="flex-1 border border-beige-dark rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage"
        />
        <a
          href="/api/admin/guests/export"
          className="bg-sage text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sage-dark text-center inline-flex items-center justify-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 px-3 py-2 bg-beige-dark/20 border border-beige-dark rounded-lg text-sm">
        <span className="text-xs font-medium text-brown-light uppercase tracking-wider">
          Select all ({filtered.length})
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            ref={dinnerCheckboxRef}
            type="checkbox"
            checked={bulk.dinnerAll}
            onChange={() => bulkUpdate('invited_to_welcome_dinner', !bulk.dinnerAll)}
            className="rounded border-beige-dark text-sage focus:ring-sage"
          />
          <span className="text-brown">Dinner</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            ref={mailedCheckboxRef}
            type="checkbox"
            checked={bulk.mailedAll}
            onChange={() => bulkUpdate('invite_mailed', !bulk.mailedAll)}
            className="rounded border-beige-dark text-sage focus:ring-sage"
          />
          <span className="text-brown">Mailed</span>
        </label>
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
