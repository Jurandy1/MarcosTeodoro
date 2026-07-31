'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { PropertyCard } from '@/components/property-card'
import type { CatalogProperty } from '@/lib/properties'

const RESUME_MS = 2800

export function AutoScrollRow({
  id,
  title,
  href,
  properties,
  reverse = false,
}: {
  id?: string
  title: string
  href: string
  properties: CatalogProperty[]
  reverse?: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loop = [...properties, ...properties]

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const pauseTemporarily = () => {
    const el = trackRef.current
    if (!el) return
    el.classList.add('is-paused')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      el.classList.remove('is-paused')
      timerRef.current = null
    }, RESUME_MS)
  }

  return (
    <div id={id}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 mb-3">
        <h3 className="text-[0.78rem] sm:text-[0.72rem] font-semibold tracking-[.14em] uppercase text-[#0b1420]">
          {title}
        </h3>
        <Link
          href={href}
          className="text-[0.7rem] sm:text-[0.62rem] font-medium tracking-[.08em] uppercase text-[#0e6b7a] hover:opacity-80 transition-opacity sm:hidden"
        >
          Ver
        </Link>
      </div>

      <div
        className="relative overflow-hidden"
        onPointerDown={pauseTemporarily}
        onTouchStart={pauseTemporarily}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 z-10"
          style={{ background: 'linear-gradient(90deg,#f7f5f1 15%,transparent)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 z-10"
          style={{ background: 'linear-gradient(270deg,#f7f5f1 15%,transparent)' }}
          aria-hidden="true"
        />

        <div
          ref={trackRef}
          className={`auto-scroll-track ${reverse ? 'reverse' : ''}`}
        >
          {loop.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="shrink-0 w-[240px] sm:w-[280px] lg:w-[300px]"
            >
              <PropertyCard
                compact
                property={p}
                href={`/${p.mode === 'venda' ? 'vendas' : 'aluguel'}/${p.id}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
