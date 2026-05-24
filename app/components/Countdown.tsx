"use client";

import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2027-05-29T00:00:00");

export default function Countdown({ inline = false }: { inline?: boolean }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const diff = WEDDING_DATE.getTime() - now.getTime();
      setDays(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    calculate();
  }, []);

  if (days === null) return null;

  if (inline) {
    return (
      <p className="font-sans text-sm tracking-[0.25em] uppercase text-brown-light">
        {days} DAYS TO GO
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="font-serif text-6xl text-brown">{days}</p>
      <p className="font-sans text-xs tracking-[0.25em] uppercase text-brown-light">days to go</p>
    </div>
  );
}
