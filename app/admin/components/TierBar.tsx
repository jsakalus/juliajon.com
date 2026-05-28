'use client';

import { useTierFilter, ADMIN_TIERS } from '@/lib/adminTier';

export default function TierBar({ className = '' }: { className?: string }) {
  const [tier, setTier] = useTierFilter();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-brown-light uppercase tracking-wider mr-1">
        Filter by tier
      </span>
      {ADMIN_TIERS.map(t => {
        const active = tier === t;
        return (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`text-sm px-3 py-0.5 rounded-full transition-colors ${
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
  );
}
