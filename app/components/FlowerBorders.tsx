"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function FlowerBorders() {
  const [ratio, setRatio] = useState(0);
  const pathname = usePathname();

  // Immediately reset when navigating to a new page
  useEffect(() => {
    setRatio(0);
  }, [pathname]);

  useEffect(() => {
    const update = () => {
      // Move out proportionally to how much of the viewport has been scrolled past
      setRatio(Math.min(1, window.scrollY / window.innerHeight));
    };
    window.addEventListener("scroll", update, { passive: true });
    const rafId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  const slidePercent = ratio * 100;
  const opacity = Math.pow(1 - ratio, 2);

  return (
    <>
      <div
        className="fixed left-0 bottom-0 hidden xl:block pointer-events-none select-none z-0"
        style={{ height: "70vh", transform: `translateX(-${slidePercent}%)`, opacity }}
      >
        <Image
          src="/borders/flowers-left.png"
          alt=""
          width={220}
          height={900}
          className="h-full w-auto object-cover object-bottom"
          style={{ filter: "drop-shadow(4px 3px 3px rgba(0,0,0,0.18))" }}
        />
      </div>
      <div
        className="fixed right-0 bottom-0 hidden xl:block pointer-events-none select-none z-0"
        style={{ height: "70vh", transform: `translateX(${slidePercent}%)`, opacity }}
      >
        <Image
          src="/borders/flowers-right.png"
          alt=""
          width={220}
          height={900}
          className="h-full w-auto object-cover object-bottom"
          style={{ filter: "drop-shadow(-4px 3px 3px rgba(0,0,0,0.18))" }}
        />
      </div>
    </>
  );
}
