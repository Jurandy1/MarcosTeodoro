'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { PropertyCard } from '@/components/property-card'
import type { CatalogProperty } from '@/lib/properties'

const RESUME_MS = 2500
const SPEED = 0.55

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
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loop = [...properties, ...properties]

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || properties.length === 0) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let raf = 0
    let ready = false

    const syncLoopPoint = () => {
      const half = el.scrollWidth / 2
      if (half <= el.clientWidth) return false
      if (reverse && el.scrollLeft < 8) {
        el.scrollLeft = half
      }
      return true
    }

    // Espera o layout/imagens para ter scrollWidth correto
    const start = () => {
      ready = syncLoopPoint()
      if (!ready) return
      if (reverse && el.scrollLeft === 0) {
        el.scrollLeft = el.scrollWidth / 2
      }
    }

    start()
    const ro = new ResizeObserver(() => start())
    ro.observe(el)

    const dir = reverse ? -1 : 1
    const tick = () => {
      if (!pausedRef.current) {
        const half = el.scrollWidth / 2
        if (half > el.clientWidth) {
          el.scrollLeft += SPEED * dir
          if (el.scrollLeft >= half) el.scrollLeft -= half
          if (el.scrollLeft <= 0) el.scrollLeft += half
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [properties.length, reverse])

  const pauseTemporarily = () => {
    pausedRef.current = true
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    // Sempre retoma sozinho — mesmo com o mouse em cima
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false
      resumeTimerRef.current = null
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

      <div className="relative">
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
          ref={scrollerRef}
          className="auto-scroll-rail flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto px-3 sm:px-4 lg:px-6 py-1 overscroll-x-contain"
          style={{
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
          }}
          onPointerDown={pauseTemporarily}
          onPointerMove={(e) => {
            if (e.buttons > 0) pauseTemporarily()
          }}
          onTouchStart={pauseTemporarily}
          onTouchMove={pauseTemporarily}
          onWheel={(e) => {
            if (Math.abs(e.deltaX) > 2 || e.shiftKey) pauseTemporarily()
          }}
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
