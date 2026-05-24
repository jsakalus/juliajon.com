"use client";

import { useEffect, useState } from "react";

// TODO: fill in your payment handles before going live
const PAYMENT_METHODS = {
  juliaVenmo: "@JuliaSakalus",
  juliaPaypal: "jmsakalus@gmail.com",
  jonathanEtransfer: "sagejonathan.tesol@email.com",
};

type RegistryItem = {
  id: string;
  name: string;
  type: "item" | "fund";
  description: string | null;
  price: number | null;
  external_url: string | null;
  image_url: string | null;
  display_order: number;
  purchased: boolean;
  total_contributed: number;
  my_contribution: number;
};

type PendingClick = {
  item_id: string;
  item_name: string;
  item_type: "item" | "fund";
  timestamp: number;
};

type ModalMode =
  | { mode: "return-item"; pending: PendingClick }
  | { mode: "return-fund"; pending: PendingClick }
  | { mode: "contribute"; item: RegistryItem }
  | { mode: "mark-purchased"; item: RegistryItem }
  | { mode: "identify" };

const LS_PENDING = "registry_pending_click";
const LS_GUEST_ID = "rsvp_guest_id";
const LS_GUEST_NAME = "rsvp_guest_name";
const TWO_HOURS = 2 * 60 * 60 * 1000;

export default function Registry() {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [guestDisplayName, setGuestDisplayName] = useState<string | null>(null);
  const [searchFirst, setSearchFirst] = useState("");
  const [searchLast, setSearchLast] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem(LS_GUEST_ID);
    const storedName = localStorage.getItem(LS_GUEST_NAME);
    if (storedId) {
      setGuestId(storedId);
      if (storedName) setGuestDisplayName(storedName);
      fetchAddress();
      fetchItems(storedId);
    } else {
      fetchItems();
    }

    const stored = localStorage.getItem(LS_PENDING);
    if (stored) {
      const parsed: PendingClick = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < TWO_HOURS) {
        setModal(
          parsed.item_type === "item"
            ? { mode: "return-item", pending: parsed }
            : { mode: "return-fund", pending: parsed }
        );
      } else {
        localStorage.removeItem(LS_PENDING);
      }
    }
  }, []);

  async function fetchItems(withGuestId?: string | null) {
    const id = withGuestId ?? guestId;
    const url = id ? `/api/registry/items?guestId=${id}` : "/api/registry/items";
    const res = await fetch(url);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  async function fetchAddress() {
    const res = await fetch("/api/registry/shipping-address");
    const data = await res.json();
    if (data.address) setShippingAddress(data.address);
  }

  function handleItemLinkClick(item: RegistryItem) {
    if (!item.external_url) return;
    localStorage.setItem(
      LS_PENDING,
      JSON.stringify({
        item_id: item.id,
        item_name: item.name,
        item_type: item.type,
        timestamp: Date.now(),
      })
    );
    window.open(item.external_url, "_blank");
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setSearchError(null);
    const res = await fetch("/api/rsvp/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: searchFirst, lastName: searchLast }),
    });
    const data = await res.json();
    if (!res.ok || !data.members) {
      setSearchError(
        data.error === "needs_last_name"
          ? "Multiple guests with that name — add your last name."
          : "We couldn't find you. Double-check your name."
      );
      setSearching(false);
      return;
    }
    const member = data.members[0];
    const name = [member.first_name, member.last_name].filter(Boolean).join(" ");
    setGuestId(member.id);
    setGuestDisplayName(name);
    localStorage.setItem(LS_GUEST_ID, member.id);
    localStorage.setItem(LS_GUEST_NAME, name);
    fetchAddress();
    fetchItems(member.id);
    setSearching(false);
  }

  async function saveContribution(opts: {
    registry_item_id: string;
    contribution_type: "purchased" | "contributed";
    amount?: number;
    guestIdOverride?: string;
    guestNameOverride?: string;
  }) {
    setSubmitting(true);
    await fetch("/api/registry/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registry_item_id: opts.registry_item_id,
        guest_id: opts.guestIdOverride ?? guestId,
        guest_name: opts.guestNameOverride ?? guestDisplayName,
        contribution_type: opts.contribution_type,
        amount: opts.amount ?? null,
      }),
    });
    localStorage.removeItem(LS_PENDING);
    setModal(null);
    setAmount("");
    setSubmitting(false);
    fetchItems(opts.guestIdOverride ?? guestId);
  }

  async function handleContributeAndSave(itemId: string) {
    let resolvedGuestId = guestId;
    let resolvedGuestName = guestDisplayName;

    if (needsIdentity) {
      setSearching(true);
      setSearchError(null);
      const res = await fetch("/api/rsvp/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: searchFirst, lastName: searchLast }),
      });
      const data = await res.json();
      if (!res.ok || !data.members) {
        setSearchError(
          data.error === "needs_last_name"
            ? "Multiple guests with that name — add your last name."
            : "We couldn't find you. Double-check your name."
        );
        setSearching(false);
        return;
      }
      const member = data.members[0];
      resolvedGuestName = [member.first_name, member.last_name].filter(Boolean).join(" ");
      resolvedGuestId = member.id;
      setGuestId(member.id);
      setGuestDisplayName(resolvedGuestName);
      localStorage.setItem(LS_GUEST_ID, member.id);
      localStorage.setItem(LS_GUEST_NAME, resolvedGuestName);
      fetchAddress();
      setSearching(false);
    }

    await saveContribution({
      registry_item_id: itemId,
      contribution_type: "contributed",
      amount: parseFloat(amount),
      guestIdOverride: resolvedGuestId ?? undefined,
      guestNameOverride: resolvedGuestName ?? undefined,
    });
  }

  function closeModal() {
    if (modal?.mode === "return-item" || modal?.mode === "return-fund") {
      localStorage.removeItem(LS_PENDING);
    }
    setModal(null);
    setAmount("");
    setSearchError(null);
  }

  const needsIdentity = !guestDisplayName;
  const funds = items.filter((i) => i.type === "fund");
  const unpurchasedItems = items.filter((i) => i.type === "item" && !i.purchased);
  const purchasedItems = items.filter((i) => i.type === "item" && i.purchased);

  // ─── Identity step (shared across all modal modes) ───────────────────────
  const identityStep = (
    <>
      <div className="flex flex-col gap-1">
        <p className="font-serif italic text-xl text-brown">Who are you?</p>
        <p className="text-sm text-brown-light">So we know who to thank ♡</p>
      </div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="First name"
          value={searchFirst}
          onChange={(e) => setSearchFirst(e.target.value)}
          className="border border-beige-dark bg-white px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-sage"
        />
        <input
          type="text"
          placeholder="Last name"
          value={searchLast}
          onChange={(e) => setSearchLast(e.target.value)}
          className="border border-beige-dark bg-white px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-sage"
        />
        {searchError && <p className="text-xs text-mauve">{searchError}</p>}
        <button
          type="submit"
          disabled={searching || !searchFirst}
          className="bg-sage text-white px-4 py-2.5 text-xs tracking-widest uppercase rounded-full disabled:opacity-50"
        >
          {searching ? "Searching…" : "Continue"}
        </button>
      </form>
      <button
        onClick={closeModal}
        className="text-xs text-brown-light text-center underline underline-offset-2"
      >
        Skip
      </button>
    </>
  );

  // ─── Modal content ────────────────────────────────────────────────────────
  let modalContent: React.ReactNode = null;

  if (modal) {
    if (modal.mode === "return-item") {
      modalContent = needsIdentity ? identityStep : (
        <>
          <div className="flex flex-col gap-1">
            <p className="font-serif italic text-xl text-brown">Did you purchase this?</p>
            <p className="text-sm text-brown-light">{modal.pending.item_name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => saveContribution({ registry_item_id: modal.pending.item_id, contribution_type: "purchased" })}
              disabled={submitting}
              className="flex-1 bg-sage text-white px-4 py-2.5 text-xs tracking-widest uppercase rounded-full disabled:opacity-50"
            >
              Yes!
            </button>
            <button
              onClick={closeModal}
              className="flex-1 border border-beige-dark text-brown-light px-4 py-2.5 text-xs tracking-widest uppercase rounded-full"
            >
              Just browsing
            </button>
          </div>
        </>
      );
    }

    if (modal.mode === "return-fund") {
      modalContent = needsIdentity ? identityStep : (
        <>
          <div className="flex flex-col gap-1">
            <p className="font-serif italic text-xl text-brown">How much did you contribute?</p>
            <p className="text-sm text-brown-light">{modal.pending.item_name}</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-brown-light">$</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-beige-dark bg-white pl-7 pr-3 py-2.5 text-sm rounded-lg w-full focus:outline-none focus:border-sage"
              />
            </div>
            <button
              onClick={() => saveContribution({ registry_item_id: modal.pending.item_id, contribution_type: "contributed", amount: parseFloat(amount) })}
              disabled={submitting || !amount}
              className="bg-sage text-white px-4 py-2.5 text-xs tracking-widest uppercase rounded-full disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Confirm"}
            </button>
            <button onClick={closeModal} className="text-xs text-brown-light text-center underline underline-offset-2">
              Cancel
            </button>
          </div>
        </>
      );
    }

    if (modal.mode === "contribute") {
      modalContent = (
        <>
          <div className="flex flex-col gap-1">
            <p className="font-serif italic text-xl text-brown">{modal.item.name}</p>
            {modal.item.description && (
              <p className="text-sm text-brown-light">{modal.item.description}</p>
            )}
          </div>

          {/* Payment info — always visible so they can send money first */}
          <div className="flex flex-col gap-3 bg-beige rounded-xl p-4">
            <p className="text-xs tracking-widest uppercase text-brown-light">Send your contribution to</p>
            <div className="flex flex-col gap-2 text-sm text-brown">
              <div className="flex justify-between">
                <span className="text-brown-light">Venmo</span>
                <span className="font-medium">{PAYMENT_METHODS.juliaVenmo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-light">PayPal</span>
                <span className="font-medium">{PAYMENT_METHODS.juliaPaypal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-light">e-Transfer</span>
                <span className="font-medium">{PAYMENT_METHODS.jonathanEtransfer}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-beige pt-4 flex flex-col gap-3">
            {needsIdentity ? (
              <>
                <p className="text-xs text-brown-light">Let us know who you are and how much you contributed.</p>
                <input
                  type="text"
                  placeholder="First name"
                  value={searchFirst}
                  onChange={(e) => setSearchFirst(e.target.value)}
                  className="border border-beige-dark bg-white px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-sage"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={searchLast}
                  onChange={(e) => setSearchLast(e.target.value)}
                  className="border border-beige-dark bg-white px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-sage"
                />
                {searchError && <p className="text-xs text-mauve">{searchError}</p>}
              </>
            ) : (
              <p className="text-xs text-brown-light">Contributing as {guestDisplayName} — how much?</p>
            )}

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-brown-light">$</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-beige-dark bg-white pl-7 pr-3 py-2.5 text-sm rounded-lg w-full focus:outline-none focus:border-sage"
              />
            </div>
            <button
              onClick={() => handleContributeAndSave(modal.item.id)}
              disabled={submitting || searching || !amount || (needsIdentity && !searchFirst)}
              className="bg-sage text-white px-4 py-2.5 text-xs tracking-widest uppercase rounded-full disabled:opacity-50"
            >
              {submitting || searching ? "Saving…" : "Confirm"}
            </button>

            <button onClick={closeModal} className="text-xs text-brown-light text-center underline underline-offset-2">
              Close
            </button>
          </div>
        </>
      );
    }

    if (modal.mode === "mark-purchased") {
      modalContent = needsIdentity ? identityStep : (
        <>
          <div className="flex flex-col gap-1">
            <p className="font-serif italic text-xl text-brown">Mark as purchased?</p>
            <p className="text-sm text-brown-light">{modal.item.name}</p>
            {guestDisplayName && (
              <p className="text-sm text-brown mt-2">Marking as purchased by <span className="font-semibold">{guestDisplayName}</span></p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => saveContribution({ registry_item_id: modal.item.id, contribution_type: "purchased" })}
              disabled={submitting}
              className="flex-1 bg-sage text-white px-4 py-2.5 text-xs tracking-widest uppercase rounded-full disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Yes, I got it!"}
            </button>
            <button
              onClick={closeModal}
              className="flex-1 border border-beige-dark text-brown-light px-4 py-2.5 text-xs tracking-widest uppercase rounded-full"
            >
              Cancel
            </button>
          </div>
        </>
      );
    }

    if (modal.mode === "identify") {
      modalContent = needsIdentity ? identityStep : (
        <>
          <p className="font-serif italic text-xl text-brown">
            Thanks, {guestDisplayName}! ♡
          </p>
          <button
            onClick={closeModal}
            className="bg-sage text-white px-4 py-2.5 text-xs tracking-widest uppercase rounded-full"
          >
            Done
          </button>
        </>
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-12">

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-brown/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex flex-col gap-6 shadow-xl max-h-[90vh] overflow-y-auto">
            {modalContent}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold font-semibold">Gifts</p>
        <h1 className="font-serif italic text-4xl text-brown font-light">Registry</h1>
        <p className="font-sans text-brown leading-relaxed mt-1">
          Honestly, we already have most things. What we&apos;re still missing tends to be higher-quality
          replacements we haven&apos;t justified buying ourselves — pieces built to last a long time. Beyond
          that, we care far more about experiences and learning than stuff, which is why you&apos;ll find a
          lot of funds here. Contributing to even one is genuinely meaningful to us.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-brown-light">Loading…</p>
      ) : (
        <>
          {/* Funds — shown first */}
          {funds.length > 0 && (
            <section className="flex flex-col gap-4">
              <p className="text-xs tracking-[0.3em] uppercase text-brown-light font-sans">Funds</p>
              <div className="flex flex-col gap-3">
                {funds.map((fund) => {
                  const pct =
                    fund.price && fund.price > 0
                      ? Math.min(100, (fund.total_contributed / fund.price) * 100)
                      : null;
                  return (
                    <div key={fund.id} className="bg-white rounded-2xl border border-beige overflow-hidden">
                      {fund.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fund.image_url} alt={fund.name} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <p className="font-serif text-brown text-base">{fund.name}</p>
                            {fund.description && (
                              <p className="text-xs text-brown-light leading-relaxed">{fund.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => setModal({ mode: "contribute", item: fund })}
                            className="shrink-0 border border-gold text-gold px-4 py-2 text-xs tracking-widest uppercase rounded-full whitespace-nowrap hover:bg-gold hover:text-white transition-colors"
                          >
                            Contribute →
                          </button>
                        </div>

                        {(fund.price || fund.total_contributed > 0) && (
                          <div className="flex flex-col gap-1.5">
                            {pct !== null && (
                              <div className="h-1.5 bg-beige rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sage rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                            <div className="flex justify-between">
                              <p className="text-xs text-brown-light">
                                ${fund.total_contributed.toLocaleString()} contributed
                              </p>
                              {fund.price && (
                                <p className="text-xs text-brown-light">
                                  Goal: ${fund.price.toLocaleString()}
                                </p>
                              )}
                            </div>
                            {fund.my_contribution > 0 && (
                              <p className="text-xs text-sage">
                                You&apos;ve contributed ${fund.my_contribution.toLocaleString()} ♡
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Items */}
          {(unpurchasedItems.length > 0 || purchasedItems.length > 0) && (
            <section className="flex flex-col gap-4">
              <p className="text-xs tracking-[0.3em] uppercase text-brown-light font-sans">Items</p>
              <div className="flex flex-col gap-3">

                {/* Unpurchased */}
                {unpurchasedItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-beige overflow-hidden">
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="font-serif text-brown text-base">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-brown-light leading-relaxed">{item.description}</p>
                          )}
                          {item.price && (
                            <p className="text-xs text-brown-light">${item.price.toLocaleString()}</p>
                          )}
                        </div>
                        {item.external_url && (
                          <button
                            onClick={() => handleItemLinkClick(item)}
                            className="shrink-0 border border-beige-dark text-brown-light px-4 py-2 text-xs tracking-widest uppercase rounded-full whitespace-nowrap hover:border-sage hover:text-sage transition-colors"
                          >
                            View →
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setModal({ mode: "mark-purchased", item })}
                        className="self-start text-xs text-brown-light underline underline-offset-2 hover:text-brown transition-colors"
                      >
                        Mark as purchased
                      </button>
                    </div>
                  </div>
                ))}

                {/* Purchased — greyed out at bottom */}
                {purchasedItems.length > 0 && (
                  <>
                    {unpurchasedItems.length > 0 && (
                      <p className="text-xs tracking-[0.3em] uppercase text-brown-light mt-2">Already taken</p>
                    )}
                    {purchasedItems.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-beige overflow-hidden opacity-50">
                        {item.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover grayscale" />
                        )}
                        <div className="bg-beige p-5 flex items-center justify-between gap-4">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <p className="font-serif text-brown-light text-base line-through">{item.name}</p>
                            {item.price && (
                              <p className="text-xs text-brown-light">${item.price.toLocaleString()}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-sage font-semibold">Purchased ✓</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Shipping address */}
          <section className="flex flex-col gap-3 border-t border-beige pt-8">
            <p className="text-xs tracking-[0.3em] uppercase text-brown-light font-sans">Shipping a gift?</p>
            {shippingAddress ? (
              <div className="bg-white rounded-2xl border border-beige p-5">
                <p className="font-sans text-sm text-brown leading-relaxed">{shippingAddress}</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-brown-light leading-relaxed">
                  We&apos;d be so touched. Let us know who you are and we&apos;ll share where to send it.
                </p>
                <button
                  onClick={() => setModal({ mode: "identify" })}
                  className="self-start border border-beige-dark text-brown-light px-4 py-2 text-xs tracking-widest uppercase rounded-full hover:border-sage hover:text-sage transition-colors"
                >
                  View address →
                </button>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
