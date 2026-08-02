'use client'

import Link from 'next/link'
import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'
import { PropertyCard } from '@/components/property-card'
import type { CatalogProperty } from '@/lib/properties'

const RESUME_MS = 2000
const SPEED = 0.45

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
  const offsetRef = useRef(0)
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)
  const movedRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loop = [...properties, ...properties]

  useEffect(() => {
    const track = trackRef.current
    if (!track || properties.length === 0) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const speed = reverse ? -SPEED : SPEED
    let raf = 0

    const halfWidth = () => track.scrollWidth / 2

    const normalize = () => {
      const half = halfWidth()
      if (half <= 0) return
      while (offsetRef.current >= half) offsetRef.current -= half
      while (offsetRef.current < 0) offsetRef.current += half
    }

    // Sentido inverso começa no meio do loop
    if (reverse) {
      offsetRef.current = halfWidth() / 2
    }

    const apply = () => {
      normalize()
      track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
    }

    apply()

    const tick = () => {
      if (!pausedRef.current) {
        offsetRef.current += speed
        apply()
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
    clearResume()
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false
      resumeTimerRef.current = null
    }, RESUME_MS)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Só arraste com toque / mouse principal
    if (e.pointerType === 'mouse' && e.button !== 0) return
    draggingRef.current = true
    movedRef.current = false
    pointerIdRef.current = e.pointerId
    startXRef.current = e.clientX
    startOffsetRef.current = offsetRef.current
    pause()
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return
    const dx = e.clientX - startXRef.current
    if (Math.abs(dx) > 6) movedRef.current = true
    // Arrastar para a direita = voltar nos imóveis que já passaram
    offsetRef.current = startOffsetRef.current - dx
    const track = trackRef.current
    if (!track) return
    const half = track.scrollWidth / 2
    if (half > 0) {
      while (offsetRef.current >= half) offsetRef.current -= half
      while (offsetRef.current < 0) offsetRef.current += half
    }
    track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return
    draggingRef.current = false
    pointerIdRef.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    scheduleResume()
  }

  const onClickCapture = (e: MouseEvent) => {
    // Evita abrir o imóvel se o gesto foi arrastar
    if (movedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      movedRef.current = false
    }
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

      <div className="relative overflow-hidden">
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
          className="auto-scroll-viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
        >
          <div ref={trackRef} className="auto-scroll-track">
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
