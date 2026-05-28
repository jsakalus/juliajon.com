'use client';

import { useState, useEffect, FormEvent } from 'react';

export type AddressFields = {
  address_line1: string | null;
  address_line2: string | null;
  address_line3: string | null;
  address_city: string | null;
  address_state: string | null;
  address_postal: string | null;
  address_country: string | null;
};

const COUNTRIES = ['Canada', 'United States', 'United Kingdom', 'Germany', 'Poland', 'Other'];

function formatPostal(country: string | null, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  switch (country) {
    case 'Canada': {
      const cleaned = trimmed.toUpperCase().replace(/\s+/g, '');
      if (cleaned.length === 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      return cleaned;
    }
    case 'United Kingdom':
      return trimmed.toUpperCase();
    case 'Poland': {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length === 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return trimmed;
    }
    case 'Germany':
      return trimmed.replace(/\D/g, '');
    default:
      return trimmed;
  }
}

export default function AddressModal({
  partyName,
  initial,
  onClose,
  onSave,
}: {
  partyName: string;
  initial: AddressFields;
  onClose: () => void;
  onSave: (fields: AddressFields) => Promise<void> | void;
}) {
  const [fields, setFields] = useState<AddressFields>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function update<K extends keyof AddressFields>(key: K, value: AddressFields[K]) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const normalized: AddressFields = {
      ...fields,
      address_postal: fields.address_postal
        ? formatPostal(fields.address_country, fields.address_postal)
        : null,
    };
    // Convert empty strings to null
    for (const key of Object.keys(normalized) as (keyof AddressFields)[]) {
      if (normalized[key] === '') normalized[key] = null;
    }
    await onSave(normalized);
    setSaving(false);
  }

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
            <h2 className="font-serif text-xl text-brown">Address</h2>
            <p className="text-sm text-brown-light mt-0.5">{partyName}</p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Country
              </span>
              <select
                value={fields.address_country ?? ''}
                onChange={e => update('address_country', e.target.value || null)}
                className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage"
              >
                <option value="">Select…</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Address 1
              </span>
              <input
                type="text"
                value={fields.address_line1 ?? ''}
                onChange={e => update('address_line1', e.target.value)}
                placeholder="Street address"
                className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Address 2 (e.g. Unit #)
              </span>
              <input
                type="text"
                value={fields.address_line2 ?? ''}
                onChange={e => update('address_line2', e.target.value)}
                placeholder="Apt, Suite, etc."
                className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Address 3
              </span>
              <input
                type="text"
                value={fields.address_line3 ?? ''}
                onChange={e => update('address_line3', e.target.value)}
                placeholder="Building, c/o, etc. (optional)"
                className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                  City
                </span>
                <input
                  type="text"
                  value={fields.address_city ?? ''}
                  onChange={e => update('address_city', e.target.value)}
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                  State / Province
                </span>
                <input
                  type="text"
                  value={fields.address_state ?? ''}
                  onChange={e => update('address_state', e.target.value)}
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Postal / Zip Code
              </span>
              <input
                type="text"
                value={fields.address_postal ?? ''}
                onChange={e => update('address_postal', e.target.value)}
                onBlur={e =>
                  update('address_postal', formatPostal(fields.address_country, e.target.value))
                }
                className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-brown-light hover:text-brown"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-sage text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sage-dark disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
