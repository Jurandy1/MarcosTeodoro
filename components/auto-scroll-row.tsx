'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { PropertyCard } from '@/components/property-card'
import type { CatalogProperty } from '@/lib/properties'

const RESUME_MS = 2200
const SPEED = 0.5

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
  const autoRef = useRef(false)
  const touchingRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loop = [...properties, ...properties]

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || properties.length === 0) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    autoRef.current = true
    if (reverse) el.scrollLeft = el.scrollWidth / 2
    autoRef.current = false

    const speed = reverse ? -SPEED : SPEED
    let raf = 0

    const tick = () => {
      if (!pausedRef.current) {
        autoRef.current = true
        el.scrollLeft += speed
        const half = el.scrollWidth / 2
        if (half > 0) {
          if (el.scrollLeft >= half) el.scrollLeft -= half
          if (el.scrollLeft <= 0) el.scrollLeft += half
        }
        autoRef.current = false
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [properties.length, reverse])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  const clearResume = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
  }

  const pause = () => {
    pausedRef.current = true
    clearResume()
  }

  const scheduleResume = () => {
    if (touchingRef.current) return
    clearResume()
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false
      resumeTimerRef.current = null
    }, RESUME_MS)
  }

  const onTouchStart = () => {
    touchingRef.current = true
    pause()
  }

  const onTouchEnd = () => {
    touchingRef.current = false
    scheduleResume()
  }

  const onUserScroll = () => {
    // Ignora o scroll que o próprio auto-scroll provoca
    if (autoRef.current) return
    pause()
    // Com o dedo ainda no ecrã não retoma; no momentum após soltar, reinicia o timer
    scheduleResume()
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
          className="auto-scroll-scroller"
          onPointerDown={onTouchStart}
          onPointerUp={onTouchEnd}
          onPointerCancel={onTouchEnd}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onScroll={onUserScroll}
          onWheel={onUserScroll}
        >
          <div className="auto-scroll-track">
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
    </div>
  )
}
