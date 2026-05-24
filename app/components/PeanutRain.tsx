'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const COUNT = 35

type Peanut = {
  id: number
  left: number
  size: number
  delay: number
  duration: number
  rotation: number
  sway: number
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function PeanutRain() {
  const [peanuts, setPeanuts] = useState<Peanut[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('peanut-rain-shown')) return
    sessionStorage.setItem('peanut-rain-shown', '1')

    const items: Peanut[] = Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      left: rand(0, 100),
      size: Math.round(rand(32, 70)),
      delay: rand(0, 1.8),
      duration: rand(1.0, 1.8),
      rotation: rand(-180, 180),
      sway: rand(-18, 18),
    }))
    setPeanuts(items)
    setVisible(true)

    const maxMs = Math.max(...items.map(p => (p.delay + p.duration) * 1000))
    const t = setTimeout(() => setVisible(false), maxMs + 300)
    return () => clearTimeout(t)
  }, [])

  if (!visible || peanuts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes peanut-fall {
          0%   { transform: translateY(-90px) translateX(0px)               rotate(0deg);       opacity: 1; }
          100% { transform: translateY(115vh) translateX(var(--sway-px))    rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {peanuts.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: 0,
              width: p.size,
              height: p.size,
              '--rot': `${p.rotation}deg`,
              '--sway-px': `${p.sway}px`,
              animation: `peanut-fall ${p.duration}s ease-in ${p.delay}s both`,
            } as React.CSSProperties}
          >
            <Image
              src="/peanut/peanut-nav.png"
              alt=""
              width={p.size}
              height={p.size}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
