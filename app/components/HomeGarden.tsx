"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BLOOMED_FLOWERS } from "../../lib/flowers";

function Flower({
  emoji,
  name,
  style,
}: {
  emoji: string;
  name?: string;
  style?: React.CSSProperties;
}) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative text-2xl cursor-default select-none"
      style={style}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((v) => !v)}
    >
      {emoji}
      {show && name && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-brown text-white rounded whitespace-nowrap pointer-events-none z-10 font-sans">
          {name}
        </span>
      )}
    </span>
  );
}

export default function HomeGarden({
  initialResponded = 0,
  initialMaybe = 0,
  initialYesNames = [],
  initialMaybeNames = [],
}: {
  initialResponded?: number;
  initialMaybe?: number;
  initialYesNames?: string[];
  initialMaybeNames?: string[];
}) {
  const [responded, setResponded] = useState(initialResponded);
  const [maybe, setMaybe] = useState(initialMaybe);
  const [yesNames, setYesNames] = useState<string[]>(initialYesNames);
  const [maybeNames, setMaybeNames] = useState<string[]>(initialMaybeNames);

  useEffect(() => {
    fetch("/api/rsvp/count", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setResponded(data.responded ?? 0);
        setMaybe(data.maybe ?? 0);
        setYesNames(data.yesNames ?? []);
        setMaybeNames(data.maybeNames ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-6 text-center">
      {(responded > 0 || maybe > 0) && (
        <div className="w-full max-w-sm">
          <p className="text-xs tracking-[0.2em] uppercase text-brown-light mb-4">
            Our Guest List Is Blooming
          </p>

          {/* Flowers — centered */}
          <div className="flex flex-wrap justify-center gap-2 mb-1">

            {Array.from({ length: responded }).map((_, i) => (
              <Flower
                key={`flower-${i}`}
                emoji={BLOOMED_FLOWERS[i % BLOOMED_FLOWERS.length]}
                name={yesNames[i]}
                style={{
                  animation: "flower-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                  animationDelay: `${i * 0.025}s`,
                }}
              />
            ))}
            {Array.from({ length: maybe }).map((_, i) => (
              <Flower
                key={`seedling-${i}`}
                emoji="🌱"
                name={maybeNames[i]}
                style={{
                  animation: "flower-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                  animationDelay: `${(responded + i) * 0.025}s`,
                }}
              />
            ))}
          </div>

          {/* Thank you note — right-aligned, rotated, arrow points up toward flowers */}
          <div className="flex justify-end pr-1 mt-1">
            <div style={{ transform: "rotate(-7deg)", transformOrigin: "right top" }} className="flex flex-col items-center gap-1">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-brown-light/40 self-start ml-3">
                <path d="M24 24 C18 16, 10 10, 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M4 10 L4 3 L11 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="font-handwritten text-brown-light/60 text-sm leading-snug text-right">
                thank you to<br />everyone that&apos;s<br />responded!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <p className="font-handwritten text-3xl text-sage">
          claim your spot in the garden.
        </p>
        <Link
          href="/rsvp"
          className="inline-block px-8 py-3.5 bg-mauve text-white font-sans text-sm tracking-widest uppercase rounded-full hover:bg-mauve/80 transition-colors font-semibold"
        >
          RSVP now
        </Link>
      </div>
    </div>
  );
}
