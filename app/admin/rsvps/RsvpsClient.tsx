'use client';

import { useState, useMemo, useEffect, FormEvent } from 'react';
import { useTierFilter } from '@/lib/adminTier';
import TierBar from '../components/TierBar';

export type RsvpStatus = 'yes' | 'no' | 'maybe' | null;
export type TravelMode = 'flying_booked' | 'flying_not_booked' | 'driving' | null;
export type Tier = 'A' | 'B' | 'C' | null;

export type RsvpRow = {
  guestId: string;
  firstName: string;
  lastName: string | null;
  partyId: string;
  partyName: string;
  partyTier: Tier;
  dinnerInvited: boolean;
  inviteMailed: boolean;
  weddingStatus: RsvpStatus;
  dinnerStatus: RsvpStatus;
  travelMode: TravelMode;
  stayingLate: boolean | null;
  dietaryNotes: string | null;
  maybeReason: string | null;
  submittedAt: string | null;
};

type Bucket = 'Yes' | 'Maybe' | 'No' | 'Pending';
const BUCKET_ORDER: Bucket[] = ['Yes', 'Maybe', 'No', 'Pending'];
const BUCKET_DOT: Record<Bucket, string> = {
  Yes: 'bg-sage',
  Maybe: 'bg-gold',
  No: 'bg-terracotta',
  Pending: 'bg-brown-light/40',
};

function bucketOf(row: RsvpRow): Bucket {
  if (row.weddingStatus === 'yes') return 'Yes';
  if (row.weddingStatus === 'maybe') return 'Maybe';
  if (row.weddingStatus === 'no') return 'No';
  return 'Pending';
}

const WEDDING_FILTERS = ['All', 'Yes', 'Maybe', 'No', 'Pending'] as const;
const DINNER_FILTERS = ['All', 'Yes', 'Maybe', 'No', 'Pending', 'Not invited'] as const;

type WeddingFilter = (typeof WEDDING_FILTERS)[number];
type DinnerFilter = (typeof DINNER_FILTERS)[number];

const TRAVEL_LABEL: Record<string, string> = {
  flying_booked: '✈ Flight booked',
  flying_not_booked: '✈ Flight not booked',
  driving: '🚐 Driving',
};

function weddingMatches(row: RsvpRow, f: WeddingFilter) {
  if (f === 'All') return true;
  if (f === 'Pending') return row.weddingStatus === null;
  return row.weddingStatus === f.toLowerCase();
}

function dinnerMatches(row: RsvpRow, f: DinnerFilter) {
  if (f === 'All') return true;
  if (f === 'Not invited') return !row.dinnerInvited;
  if (!row.dinnerInvited) return false;
  if (f === 'Pending') return row.dinnerStatus === null;
  return row.dinnerStatus === f.toLowerCase();
}

function FilterChips<T extends string>({ options, value, onChange, label }: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-brown-light uppercase tracking-wider mr-1">
        {label}
      </span>
      {options.map(o => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`text-sm px-2.5 py-0.5 rounded-full transition-colors ${
              active
                ? 'bg-brown text-beige'
                : 'bg-white border border-beige-dark text-brown hover:border-brown'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function StatusPill({ label, status, muted = false }: {
  label: string;
  status: RsvpStatus | 'not_invited';
  muted?: boolean;
}) {
  const color =
    status === 'yes'   ? 'bg-sage' :
    status === 'no'    ? 'bg-terracotta' :
    status === 'maybe' ? 'bg-gold' :
    'bg-brown-light/30';
  const text =
    status === 'yes'   ? 'Yes' :
    status === 'no'    ? 'No' :
    status === 'maybe' ? 'Maybe' :
    status === 'not_invited' ? 'Not invited' :
    'Pending';
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${muted ? 'opacity-60' : ''}`}>
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-brown-light">{label}</span>
      <span className="text-brown font-medium">{text}</span>
    </span>
  );
}

function RsvpCard({ row, onEdit }: { row: RsvpRow; onEdit: () => void }) {
  const fullName = `${row.firstName}${row.lastName ? ' ' + row.lastName : ''}`;
  const isPending = row.weddingStatus === null;
  const isNo = row.weddingStatus === 'no';

  return (
    <div className={`bg-white border border-beige-dark rounded-xl shadow-sm px-3 py-2.5 sm:px-4 sm:py-3 ${isNo ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-serif text-base text-brown truncate">{fullName}</span>
            <span className="text-xs text-brown-light">
              {row.partyName}
              {row.partyTier && <span className="ml-1 px-1.5 rounded bg-beige-dark/40 text-brown">{row.partyTier}</span>}
            </span>
          </div>
          {isPending ? (
            <p className="text-sm text-brown-light mt-1 italic">⏳ No response yet</p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <StatusPill label="Wedding" status={row.weddingStatus} />
              <StatusPill
                label="Dinner"
                status={row.dinnerInvited ? row.dinnerStatus : 'not_invited'}
                muted={!row.dinnerInvited}
              />
              {row.travelMode && (
                <span className="text-xs text-brown">{TRAVEL_LABEL[row.travelMode] ?? row.travelMode}</span>
              )}
              {row.stayingLate === true && (
                <span className="text-xs text-brown">🎉 Staying late</span>
              )}
            </div>
          )}
          {row.dietaryNotes && (
            <p className="text-xs text-brown mt-1.5">
              <span className="text-brown-light">Dietary:</span> {row.dietaryNotes}
            </p>
          )}
          {row.maybeReason && (
            <p className="text-xs text-brown mt-1.5">
              <span className="text-brown-light">Note:</span> {row.maybeReason}
            </p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="text-sm font-medium px-3 py-1 rounded-lg border border-sage text-sage hover:bg-sage hover:text-white transition-colors shrink-0"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function EditRsvpModal({
  row,
  onClose,
  onSave,
  onReset,
}: {
  row: RsvpRow;
  onClose: () => void;
  onSave: (updates: Partial<RsvpRow>) => Promise<void>;
  onReset: () => Promise<void>;
}) {
  const [weddingStatus, setWeddingStatus] = useState<RsvpStatus>(row.weddingStatus);
  const [dinnerStatus, setDinnerStatus] = useState<RsvpStatus>(row.dinnerStatus);
  const [travelMode, setTravelMode] = useState<TravelMode>(row.travelMode);
  const [stayingLate, setStayingLate] = useState<boolean>(row.stayingLate === true);
  const [dietaryNotes, setDietaryNotes] = useState<string>(row.dietaryNotes ?? '');
  const [maybeReason, setMaybeReason] = useState<string>(row.maybeReason ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const showDinner = row.dinnerInvited && weddingStatus === 'yes';
  const showExtras = weddingStatus === 'yes';
  const showMaybeReason = weddingStatus === 'maybe';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      weddingStatus,
      dinnerStatus: showDinner ? dinnerStatus : null,
      travelMode: showExtras ? travelMode : null,
      stayingLate: showExtras ? stayingLate : null,
      dietaryNotes: weddingStatus === 'no' ? '' : dietaryNotes,
      maybeReason: showMaybeReason ? maybeReason : null,
    });
    setSaving(false);
  }

  async function handleReset() {
    if (!confirm('Reset this guest to "pending" (removes their RSVP entirely)?')) return;
    setSaving(true);
    await onReset();
    setSaving(false);
  }

  const fullName = `${row.firstName}${row.lastName ? ' ' + row.lastName : ''}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-brown/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <h2 className="font-serif text-xl text-brown">Edit RSVP</h2>
            <p className="text-sm text-brown-light mt-0.5">{fullName} · {row.partyName}</p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1.5">
                Wedding
              </span>
              <div className="flex flex-wrap gap-2">
                {(['yes', 'maybe', 'no'] as const).map(s => (
                  <label key={s} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="wedding"
                      checked={weddingStatus === s}
                      onChange={() => setWeddingStatus(s)}
                    />
                    <span className="capitalize text-brown">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {showDinner && (
              <div>
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1.5">
                  Welcome dinner
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['yes', 'maybe', 'no'] as const).map(s => (
                    <label key={s} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="dinner"
                        checked={dinnerStatus === s}
                        onChange={() => setDinnerStatus(s)}
                      />
                      <span className="capitalize text-brown">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {showExtras && (
              <>
                <div>
                  <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1.5">
                    Travel
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ['flying_booked', 'Flight booked'],
                      ['flying_not_booked', 'Flight not booked'],
                      ['driving', 'Driving'],
                    ] as const).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-1.5 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="travel"
                          checked={travelMode === value}
                          onChange={() => setTravelMode(value)}
                        />
                        <span className="text-brown">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stayingLate}
                    onChange={e => setStayingLate(e.target.checked)}
                    className="rounded border-beige-dark text-sage focus:ring-sage"
                  />
                  <span className="text-brown">Staying for the late-night party</span>
                </label>
              </>
            )}

            {weddingStatus !== 'no' && (
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1.5">
                  Dietary notes
                </span>
                <textarea
                  value={dietaryNotes}
                  onChange={e => setDietaryNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </label>
            )}

            {showMaybeReason && (
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1.5">
                  Note (maybe reason)
                </span>
                <textarea
                  value={maybeReason}
                  onChange={e => setMaybeReason(e.target.value)}
                  rows={2}
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </label>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-6">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="text-sm text-terracotta hover:underline disabled:opacity-50"
            >
              Reset to pending
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-brown-light hover:text-brown"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || weddingStatus === null}
                className="bg-sage text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sage-dark disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RsvpsClient({ initialRows }: { initialRows: RsvpRow[] }) {
  const [rows, setRows] = useState<RsvpRow[]>(initialRows);
  const [tierFilter] = useTierFilter();
  const [weddingFilter, setWeddingFilter] = useState<WeddingFilter>('All');
  const [dinnerFilter, setDinnerFilter] = useState<DinnerFilter>('All');
  const [search, setSearch] = useState('');
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  const mailed = useMemo(
    () => rows.filter(r => r.inviteMailed && (tierFilter === 'All' || r.partyTier === tierFilter)),
    [rows, tierFilter]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mailed.filter(r => {
      if (!weddingMatches(r, weddingFilter)) return false;
      if (!dinnerMatches(r, dinnerFilter)) return false;
      if (q) {
        const full = `${r.firstName} ${r.lastName ?? ''} ${r.partyName}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [mailed, weddingFilter, dinnerFilter, search]);

  const grouped = useMemo(() => {
    const g: Record<Bucket, RsvpRow[]> = { Yes: [], Maybe: [], No: [], Pending: [] };
    for (const r of filtered) g[bucketOf(r)].push(r);
    return g;
  }, [filtered]);

  const stats = useMemo(() => {
    const total = mailed.length;
    const responded = mailed.filter(r => r.weddingStatus !== null).length;
    return { total, responded, pending: total - responded, filtered: filtered.length };
  }, [mailed, filtered]);

  const noInvitesMailed = mailed.length === 0;

  const editingRow = rows.find(r => r.guestId === editingGuestId) ?? null;

  async function saveEdit(updates: Partial<RsvpRow>) {
    if (!editingRow) return;
    const guestId = editingRow.guestId;
    const prev = rows;
    setRows(rs => rs.map(r => (r.guestId === guestId ? { ...r, ...updates } : r)));
    setEditingGuestId(null);

    const res = await fetch(`/api/admin/rsvps/${guestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wedding_attending_status: updates.weddingStatus,
        welcome_dinner_status: updates.dinnerStatus,
        travel_mode: updates.travelMode,
        staying_late: updates.stayingLate,
        dietary_notes: updates.dietaryNotes,
        maybe_reason: updates.maybeReason,
      }),
    });
    if (!res.ok) {
      setRows(prev);
      const data = await res.json().catch(() => ({}));
      alert(`Save failed: ${data.error ?? res.statusText}`);
    }
  }

  async function resetEdit() {
    if (!editingRow) return;
    const guestId = editingRow.guestId;
    const prev = rows;
    setRows(rs =>
      rs.map(r =>
        r.guestId === guestId
          ? {
              ...r,
              weddingStatus: null,
              dinnerStatus: null,
              travelMode: null,
              stayingLate: null,
              dietaryNotes: null,
              maybeReason: null,
              submittedAt: null,
            }
          : r
      )
    );
    setEditingGuestId(null);

    const res = await fetch(`/api/admin/rsvps/${guestId}`, { method: 'DELETE' });
    if (!res.ok) {
      setRows(prev);
      const data = await res.json().catch(() => ({}));
      alert(`Reset failed: ${data.error ?? res.statusText}`);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-serif text-2xl sm:text-3xl text-brown">
          RSVPs
          {tierFilter !== 'All' && <span className="text-base sm:text-lg text-brown-light"> · Tier {tierFilter}</span>}
        </h1>
        <p className="text-sm text-brown-light mt-1">
          {stats.total} invited · {stats.responded} responded · {stats.pending} pending
          {stats.filtered !== stats.total && (
            <> · <span className="text-brown font-medium">{stats.filtered} shown</span></>
          )}
        </p>
        <TierBar className="mt-3" />
      </div>

      <div className="space-y-2 mb-3">
        <FilterChips label="Wedding" options={WEDDING_FILTERS} value={weddingFilter} onChange={setWeddingFilter} />
        <FilterChips label="Dinner" options={DINNER_FILTERS} value={dinnerFilter} onChange={setDinnerFilter} />
      </div>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by guest or party name…"
        className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage mb-4"
      />

      {noInvitesMailed ? (
        <div className="bg-white border border-beige-dark rounded-2xl shadow-sm p-6 text-center">
          <p className="text-sm text-brown-light">
            No invites mailed yet
            {tierFilter !== 'All' ? <> for Tier {tierFilter}</> : ''}. RSVPs appear here once you mark a
            party&apos;s invite as mailed on the Guests page.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {BUCKET_ORDER.map(bucket => {
            const items = grouped[bucket];
            const hiddenByFilter = weddingFilter !== 'All' && weddingFilter !== bucket;
            if (hiddenByFilter) return null;
            return (
              <section key={bucket}>
                <header className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${BUCKET_DOT[bucket]}`} />
                  <h2 className="font-serif text-lg text-brown">{bucket}</h2>
                  <span className="text-sm text-brown-light tabular-nums">({items.length})</span>
                </header>
                {items.length === 0 ? (
                  <p className="text-sm text-brown-light italic px-1">No one in this group.</p>
                ) : (
                  <div className="space-y-2">
                    {items.map(row => (
                      <RsvpCard
                        key={row.guestId}
                        row={row}
                        onEdit={() => setEditingGuestId(row.guestId)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {editingRow && (
        <EditRsvpModal
          row={editingRow}
          onClose={() => setEditingGuestId(null)}
          onSave={saveEdit}
          onReset={resetEdit}
        />
      )}
    </div>
  );
}
