'use client';

import { useState, useEffect } from 'react';

export type AdminTier = 'All' | 'A' | 'B' | 'C';
export const ADMIN_TIERS: AdminTier[] = ['All', 'A', 'B', 'C'];

const STORAGE_KEY = 'admin_tier_filter';
const CHANGE_EVENT = 'admin-tier-changed';

function readTier(): AdminTier {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'A' || v === 'B' || v === 'C' || v === 'All') return v;
  } catch {}
  return 'All';
}

export function useTierFilter(): [AdminTier, (t: AdminTier) => void] {
  const [tier, setTierState] = useState<AdminTier>('All');

  useEffect(() => {
    setTierState(readTier());
    function onChange() {
      setTierState(readTier());
    }
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  function setTier(t: AdminTier) {
    setTierState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return [tier, setTier];
}
