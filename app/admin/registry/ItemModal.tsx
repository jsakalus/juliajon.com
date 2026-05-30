'use client';

import { useState, useEffect, FormEvent } from 'react';

export type RegistryItemDraft = {
  id?: string;
  name: string;
  type: 'item' | 'fund';
  description: string | null;
  price: number | null;
  external_url: string | null;
  image_url: string | null;
  display_order: number | null;
  max_quantity: number | null;
  is_active: boolean;
};

const EMPTY: RegistryItemDraft = {
  name: '',
  type: 'item',
  description: '',
  price: null,
  external_url: '',
  image_url: '',
  display_order: null,
  max_quantity: null,
  is_active: true,
};

export default function ItemModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Partial<RegistryItemDraft>;
  onClose: () => void;
  onSave: (draft: RegistryItemDraft) => Promise<void>;
}) {
  const isNew = !initial?.id;
  const [draft, setDraft] = useState<RegistryItemDraft>({ ...EMPTY, ...initial });
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function update<K extends keyof RegistryItemDraft>(key: K, value: RegistryItemDraft[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  async function fetchFromUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setFetching(true);
    setFetchMsg(null);
    try {
      const res = await fetch('/api/admin/registry/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchMsg(`Couldn't fetch: ${data.error ?? res.statusText}`);
        return;
      }
      setDraft(d => ({
        ...d,
        name: data.name || d.name,
        description: data.description || d.description,
        image_url: data.image_url || d.image_url,
        price: data.price !== null ? data.price : d.price,
        external_url: data.url || d.external_url,
      }));
      const missing: string[] = [];
      if (!data.found.name) missing.push('name');
      if (!data.found.price) missing.push('price');
      if (!data.found.image) missing.push('image');
      setFetchMsg(
        missing.length === 0
          ? 'Filled in everything we could find.'
          : `Filled some fields. Missing: ${missing.join(', ')}.`
      );
    } catch (err) {
      setFetchMsg(`Couldn't fetch: ${(err as Error).message}`);
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setSaving(true);
    // Coerce empty strings to null for nullable text fields
    const cleaned: RegistryItemDraft = {
      ...draft,
      description: draft.description?.trim() ? draft.description.trim() : null,
      external_url: draft.external_url?.trim() ? draft.external_url.trim() : null,
      image_url: draft.image_url?.trim() ? draft.image_url.trim() : null,
    };
    await onSave(cleaned);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-brown/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <h2 className="font-serif text-xl text-brown">
              {isNew ? 'Add registry item' : 'Edit registry item'}
            </h2>
          </div>

          {isNew && (
            <div className="bg-beige rounded-lg p-3 mb-5">
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                  Paste a product URL (optional)
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://…"
                    className="flex-1 border border-beige-dark rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                  <button
                    type="button"
                    onClick={fetchFromUrl}
                    disabled={fetching || !url.trim()}
                    className="bg-sage text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-sage-dark disabled:opacity-50 whitespace-nowrap"
                  >
                    {fetching ? 'Fetching…' : 'Fetch details'}
                  </button>
                </div>
              </label>
              {fetchMsg && (
                <p className="text-xs text-brown-light mt-2">{fetchMsg}</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-3">
              <label className="block flex-1">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                  Name <span className="text-mauve">*</span>
                </span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={e => update('name', e.target.value)}
                  required
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </label>
              <label className="block w-32">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                  Type
                </span>
                <select
                  value={draft.type}
                  onChange={e => update('type', e.target.value as 'item' | 'fund')}
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage"
                >
                  <option value="item">Item</option>
                  <option value="fund">Fund</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Description
              </span>
              <textarea
                value={draft.description ?? ''}
                onChange={e => update('description', e.target.value)}
                rows={3}
                className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                  {draft.type === 'fund' ? 'Goal ($)' : 'Price ($)'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.price ?? ''}
                  onChange={e =>
                    update('price', e.target.value === '' ? null : Number(e.target.value))
                  }
                  placeholder={draft.type === 'fund' ? 'unlimited' : ''}
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                  Max qty
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={draft.max_quantity ?? ''}
                  onChange={e =>
                    update('max_quantity', e.target.value === '' ? null : Number(e.target.value))
                  }
                  placeholder={draft.type === 'fund' ? 'n/a' : 'unlimited'}
                  disabled={draft.type === 'fund'}
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage disabled:bg-beige disabled:text-brown-light"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                  Order
                </span>
                <input
                  type="number"
                  step="1"
                  value={draft.display_order ?? ''}
                  onChange={e =>
                    update('display_order', e.target.value === '' ? null : Number(e.target.value))
                  }
                  placeholder="auto"
                  className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                External URL (product page / payment link)
              </span>
              <input
                type="url"
                value={draft.external_url ?? ''}
                onChange={e => update('external_url', e.target.value)}
                placeholder="https://…"
                className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-brown-light uppercase tracking-wider mb-1">
                Image URL
              </span>
              <input
                type="url"
                value={draft.image_url ?? ''}
                onChange={e => update('image_url', e.target.value)}
                placeholder="https://…"
                className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
              {draft.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.image_url}
                  alt=""
                  className="mt-2 max-h-32 rounded border border-beige-dark"
                  onError={e => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              )}
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={e => update('is_active', e.target.checked)}
                className="rounded border-beige-dark text-sage focus:ring-sage"
              />
              <span className="text-sm text-brown">Visible on the public registry page</span>
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
              disabled={saving || !draft.name.trim()}
              className="bg-sage text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sage-dark disabled:opacity-50"
            >
              {saving ? 'Saving…' : isNew ? 'Add item' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
