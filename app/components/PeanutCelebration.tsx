"use client";

import { useState } from "react";
import Image from "next/image";

export default function PeanutCelebration({
  onDismiss,
  permanent = false,
}: {
  onDismiss: () => void;
  permanent?: boolean;
}) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => {
    if (permanent || leaving) return;
    setLeaving(true);
    setTimeout(onDismiss, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${permanent ? "" : "cursor-pointer"}`}
      onClick={dismiss}
      aria-label={permanent ? undefined : "Tap to dismiss"}
    >
      <div
        className="absolute bottom-0 left-0"
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
          className="object-contain h-[80vh] w-auto"
          priority
        />
      </div>
    </div>
  );
}
