"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PeanutCelebration({
  onDismiss,
  permanent = false,
}: {
  onDismiss: () => void;
  permanent?: boolean;
}) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (permanent) return;
    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 250);
    }, 5000);
    return () => clearTimeout(timer);
  }, [permanent, onDismiss]);

  return (
    <div className="fixed bottom-0 left-0 z-50 pointer-events-none">
      <div
        style={{
          animation: leaving
            ? "slide-out-left 0.25s ease-in forwards"
            : "slide-in-left 0.9s ease-out forwards",
        }}
      >
        <Image
          src="/peanut-celebrate.png"
          alt="Peanut celebrating"
          width={800}
          height={1000}
          className="object-contain h-[50vh] w-auto"
          priority
        />
      </div>
    </div>
  );
}
