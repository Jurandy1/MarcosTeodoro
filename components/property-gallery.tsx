'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export function PropertyGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const total = images.length

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + total) % total)
    },
    [total],
  )

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, go])

  useEffect(() => {
    const el = thumbsRef.current?.querySelector<HTMLElement>(`[data-thumb="${active}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [active])

  if (!total) return null

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 h-full">
        <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] md:min-h-[460px] bg-[#eceae6] overflow-hidden">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setLightbox(true)}
            aria-label="Ampliar foto"
          >
            <Image
              src={images[active]}
              alt={`${title} — ${active + 1}/${total}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 65vw"
            />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(-1)
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 text-[#111] flex items-center justify-center text-lg shadow-sm hover:bg-white"
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(1)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 text-[#111] flex items-center justify-center text-lg shadow-sm hover:bg-white"
                aria-label="Próxima"
              >
                ›
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 bg-black/65 text-white text-[11px] px-2.5 py-1 tracking-wide">
            {active + 1} / {total}
          </div>
        </div>

        {total > 1 && (
          <div
            ref={thumbsRef}
            className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-[100px] lg:w-[112px] md:max-h-[460px] shrink-0"
          >
            {images.map((src, i) => (
              <button
                key={`${i}-${src}`}
                type="button"
                data-thumb={i}
                onClick={() => setActive(i)}
                className={`relative shrink-0 w-[72px] md:w-full aspect-[4/3] overflow-hidden ${
                  active === i ? 'ring-2 ring-[#0e6b7a] ring-offset-1' : 'opacity-60 hover:opacity-100'
                }`}
                aria-label={`Foto ${i + 1}`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="112px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col" role="dialog" aria-modal="true">
          <div className="flex justify-between items-center px-4 py-3 text-white text-sm">
            <span>
              {active + 1} / {total}
            </span>
            <button type="button" onClick={() => setLightbox(false)} className="text-2xl px-2" aria-label="Fechar">
              ×
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={images[active]} alt="" fill className="object-contain p-4" sizes="100vw" />
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 text-white text-2xl bg-white/10 hover:bg-white/20"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 text-white text-2xl bg-white/10 hover:bg-white/20"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
