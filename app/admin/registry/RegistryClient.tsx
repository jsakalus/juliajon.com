'use client';

import { useState, useMemo } from 'react';
import ItemModal, { RegistryItemDraft } from './ItemModal';

export type RegistryItem = {
  id: string;
  name: string;
  type: 'item' | 'fund';
  description: string | null;
  price: number | null;
  external_url: string | null;
  image_url: string | null;
  display_order: number | null;
  max_quantity: number | null;
  is_active: boolean;
  created_at: string;
  purchased_count: number;
  contributed_total: number;
};

function money(n: number | null): string {
  if (n === null || n === undefined) return '';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 === 0 ? 0 : 2 })}`;
}

function ItemCard({
  item,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  item: RegistryItem;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const isFund = item.type === 'fund';
  const subline = isFund
    ? `${money(item.contributed_total)} contributed${item.price ? ' of ' + money(item.price) : ''}`
    : item.max_quantity === null
      ? `${item.purchased_count} purchased · unlimited`
      : `${item.purchased_count} / ${item.max_quantity} purchased`;

  return (
    <div
      className={`bg-white border border-beige-dark rounded-xl shadow-sm p-3 sm:p-4 flex gap-3 ${
        item.is_active ? '' : 'opacity-50'
      }`}
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg bg-beige overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="w-full h-full object-contain" />
        ) : (
          <span className="text-brown-light/50 text-xs uppercase tracking-wider">
            {isFund ? 'Fund' : 'Item'}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-serif text-base text-brown truncate">{item.name}</h3>
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  isFund ? 'bg-gold/20 text-brown' : 'bg-sage/20 text-brown'
                }`}
              >
                {isFund ? 'Fund' : 'Item'}
              </span>
              {!item.is_active && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-brown-light/20 text-brown-light">
                  Hidden
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-brown-light mt-1 line-clamp-2">{item.description}</p>
            )}
            <p className="text-xs text-brown mt-1.5 tabular-nums">
              {!isFund && item.price !== null && <>{money(item.price)} · </>}
              {subline}
              {item.display_order !== null && (
                <span className="text-brown-light"> · order {item.display_order}</span>
              )}
            </p>
            {item.external_url && (
              <a
                href={item.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sage hover:underline truncate block mt-1"
              >
                {item.external_url}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <label className="flex items-center gap-1 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={item.is_active}
            onChange={onToggleActive}
            className="rounded border-beige-dark text-sage focus:ring-sage"
          />
          <span className="text-brown">Active</span>
        </label>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-sage text-sage hover:bg-sage hover:text-white transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-terracotta text-terracotta hover:bg-terracotta hover:text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegistryClient({ initialItems }: { initialItems: RegistryItem[] }) {
  const [items, setItems] = useState<RegistryItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'item' | 'fund'>('All');
  const [showHidden, setShowHidden] = useState(true);
  const [modalState, setModalState] = useState<
    { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; item: RegistryItem }
  >({ mode: 'closed' });

  const stats = useMemo(() => {
    const itemsCount = items.filter(i => i.type === 'item').length;
    const fundsCount = items.filter(i => i.type === 'fund').length;
    const hiddenCount = items.filter(i => !i.is_active).length;
    return { itemsCount, fundsCount, hiddenCount, total: items.length };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(i => {
      if (typeFilter !== 'All' && i.type !== typeFilter) return false;
      if (!showHidden && !i.is_active) return false;
      if (q && !i.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, typeFilter, showHidden]);

  async function addItem(draft: RegistryItemDraft) {
    const res = await fetch('/api/admin/registry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`Add failed: ${data.error ?? res.statusText}`);
      return;
    }
    setItems(prev => [...prev, data.item].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)));
    setModalState({ mode: 'closed' });
  }

  async function editItem(draft: RegistryItemDraft) {
    if (!draft.id) return;
    const prev = items;
    const id = draft.id;
    setItems(p =>
      p
        .map(i => (i.id === id ? { ...i, ...draft } as RegistryItem : i))
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    );
    setModalState({ mode: 'closed' });

    const { id: _ignore, ...payload } = draft;
    const res = await fetch(`/api/admin/registry/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setItems(prev);
      const data = await res.json().catch(() => ({}));
      alert(`Save failed: ${data.error ?? res.statusText}`);
    }
  }

  async function toggleActive(item: RegistryItem) {
    const prev = items;
    setItems(p => p.map(i => (i.id === item.id ? { ...i, is_active: !i.is_active } : i)));
    const res = await fetch(`/api/admin/registry/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    if (!res.ok) {
      setItems(prev);
      const data = await res.json().catch(() => ({}));
      alert(`Save failed: ${data.error ?? res.statusText}`);
    }
  }

  async function deleteItem(item: RegistryItem) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    const prev = items;
    setItems(p => p.filter(i => i.id !== item.id));
    const res = await fetch(`/api/admin/registry/${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setItems(prev);
      const data = await res.json().catch(() => ({}));
      alert(`Delete failed: ${data.error ?? res.statusText}`);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-brown">Registry</h1>
          <p className="text-sm text-brown-light mt-1">
            {stats.itemsCount} items · {stats.fundsCount} funds
            {stats.hiddenCount > 0 && <> · {stats.hiddenCount} hidden</>}
          </p>
        </div>
        <button
          onClick={() => setModalState({ mode: 'add' })}
          className="bg-sage text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sage-dark shrink-0"
        >
          + Add item
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(['All', 'item', 'fund'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              typeFilter === t
                ? 'bg-brown text-beige'
                : 'bg-white border border-beige-dark text-brown hover:border-brown'
            }`}
          >
            {t === 'All' ? 'All' : t === 'item' ? 'Items' : 'Funds'}
          </button>
        ))}
        <label className="flex items-center gap-1.5 text-sm cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={e => setShowHidden(e.target.checked)}
            className="rounded border-beige-dark text-sage focus:ring-sage"
          />
          <span className="text-brown">Show hidden</span>
        </label>
      </div>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name…"
        className="w-full border border-beige-dark rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage mb-4"
      />

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-brown-light text-center py-8">
            {items.length === 0
              ? 'No items yet. Click "Add item" to get started.'
              : 'No items match your filters.'}
          </p>
        ) : (
          filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={() => setModalState({ mode: 'edit', item })}
              onToggleActive={() => toggleActive(item)}
              onDelete={() => deleteItem(item)}
            />
          ))
        )}
      </div>

      {modalState.mode === 'add' && (
        <ItemModal onClose={() => setModalState({ mode: 'closed' })} onSave={addItem} />
      )}
      {modalState.mode === 'edit' && (
        <ItemModal
          initial={modalState.item}
          onClose={() => setModalState({ mode: 'closed' })}
          onSave={editItem}
        />
      )}
    </div>
  );
}
