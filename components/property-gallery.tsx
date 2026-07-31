'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type MediaItem,
  youtubeEmbedUrl,
  youtubeThumb,
} from '@/lib/property-images'

const SIDEBAR_VISIBLE = 7

type FilterTab = 'todos' | 'fotos' | 'videos'

export function PropertyGallery({
  media,
  title,
}: {
  media: MediaItem[]
  title: string
}) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [gridOpen, setGridOpen] = useState(false)
  const [tab, setTab] = useState<FilterTab>('todos')
  const thumbsRef = useRef<HTMLDivElement>(null)
  const total = media.length

  const photoCount = useMemo(() => media.filter((m) => m.type === 'image').length, [media])
  const videoCount = useMemo(() => media.filter((m) => m.type === 'video').length, [media])

  const filteredGrid = useMemo(() => {
    if (tab === 'fotos') return media.map((m, i) => ({ m, i })).filter((x) => x.m.type === 'image')
    if (tab === 'videos') return media.map((m, i) => ({ m, i })).filter((x) => x.m.type === 'video')
    return media.map((m, i) => ({ m, i }))
  }, [media, tab])

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + total) % total)
    },
    [total],
  )

  useEffect(() => {
    if (!lightbox && !gridOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(false)
        setGridOpen(false)
      }
      if (lightbox) {
        if (e.key === 'ArrowLeft') go(-1)
        if (e.key === 'ArrowRight') go(1)
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, gridOpen, go])

  useEffect(() => {
    const el = thumbsRef.current?.querySelector<HTMLElement>(`[data-thumb="${active}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [active])

  if (!total) return null

  const current = media[active]
  const extraCount = Math.max(0, total - SIDEBAR_VISIBLE)
  const sidebarItems = media.slice(0, SIDEBAR_VISIBLE)

  const openAt = (index: number) => {
    setActive(index)
    setGridOpen(false)
    setLightbox(true)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2">
        {/* Stage principal */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] md:min-h-[460px] bg-[#eceae6] overflow-hidden">
          <MediaStage
            item={current}
            title={title}
            index={active}
            total={total}
            onOpen={() => setLightbox(true)}
          />

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 text-[#111] flex items-center justify-center text-lg shadow-sm hover:bg-white"
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 text-[#111] flex items-center justify-center text-lg shadow-sm hover:bg-white"
                aria-label="Próxima"
              >
                ›
              </button>
            </>
          )}

          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-black/65 text-white text-[11px] px-2.5 py-1 tracking-wide">
                {current.type === 'video' ? 'Vídeo' : 'Foto'} {active + 1} / {total}
              </span>
              {videoCount > 0 && (
                <span className="bg-black/55 text-white text-[11px] px-2 py-1">
                  {photoCount} fotos · {videoCount} {videoCount === 1 ? 'vídeo' : 'vídeos'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setGridOpen(true)}
              className="bg-white/95 text-[#111] text-[11px] font-semibold tracking-[0.06em] uppercase px-3 py-1.5 hover:bg-white"
            >
              Ver todas ({total})
            </button>
          </div>
        </div>

        {/* Miniaturas laterais — só as primeiras + atalho para o restante */}
        {total > 1 && (
          <div
            ref={thumbsRef}
            className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-[100px] lg:w-[112px] md:max-h-[460px] shrink-0"
          >
            {sidebarItems.map((item, i) => (
              <Thumb
                key={`side-${i}`}
                item={item}
                active={active === i}
                onClick={() => setActive(i)}
                dataThumb={i}
              />
            ))}
            {extraCount > 0 && (
              <button
                type="button"
                onClick={() => setGridOpen(true)}
                className="relative shrink-0 w-[72px] md:w-full aspect-[4/3] bg-[#111827] text-white flex flex-col items-center justify-center gap-0.5 hover:bg-[#1f2937]"
              >
                <span className="text-[15px] font-semibold">+{extraCount}</span>
                <span className="text-[10px] uppercase tracking-wide opacity-80">ver mais</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grade completa — essencial com 60+ mídias */}
      {gridOpen && (
        <div className="fixed inset-0 z-[80] bg-white flex flex-col" role="dialog" aria-modal="true">
          <div className="border-b border-[#e5e7eb] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-[#111827]">{title}</p>
              <p className="text-[12px] text-[#6b7280]">
                {photoCount} fotos
                {videoCount > 0 ? ` · ${videoCount} ${videoCount === 1 ? 'vídeo' : 'vídeos'}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(['todos', 'fotos', 'videos'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-[12px] font-medium capitalize ${
                    tab === t
                      ? 'bg-[#111827] text-white'
                      : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                  } ${t === 'videos' && videoCount === 0 ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  {t === 'todos' ? 'Todas' : t === 'fotos' ? 'Fotos' : 'Vídeos'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setGridOpen(false)}
                className="ml-2 w-9 h-9 text-xl text-[#6b7280] hover:text-[#111]"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-[1100px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {filteredGrid.map(({ m, i }) => (
                <button
                  key={`grid-${i}`}
                  type="button"
                  onClick={() => openAt(i)}
                  className="relative aspect-[4/3] overflow-hidden bg-[#eceae6] group text-left"
                >
                  <ThumbImage item={m} sizes="220px" />
                  {m.type === 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <PlayBadge />
                    </span>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5">
                    {m.type === 'video' ? 'Vídeo' : i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox foco em um item */}
      {lightbox && (
        <div className="fixed inset-0 z-[85] bg-black/95 flex flex-col" role="dialog" aria-modal="true">
          <div className="flex justify-between items-center px-4 py-3 text-white text-sm">
            <span>
              {current.type === 'video' ? 'Vídeo' : 'Foto'} {active + 1} / {total}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLightbox(false)
                  setGridOpen(true)
                }}
                className="text-[12px] uppercase tracking-wide opacity-80 hover:opacity-100"
              >
                Grade
              </button>
              <button type="button" onClick={() => setLightbox(false)} className="text-2xl px-2" aria-label="Fechar">
                ×
              </button>
            </div>
          </div>
          <div className="relative flex-1 min-h-0">
            <MediaStage
              item={current}
              title={title}
              index={active}
              total={total}
              contained
              autoPlayVideo
            />
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 text-white text-2xl bg-white/10 hover:bg-white/20 z-10"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 text-white text-2xl bg-white/10 hover:bg-white/20 z-10"
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

function MediaStage({
  item,
  title,
  index,
  total,
  onOpen,
  contained,
  autoPlayVideo,
}: {
  item: MediaItem
  title: string
  index: number
  total: number
  onOpen?: () => void
  contained?: boolean
  autoPlayVideo?: boolean
}) {
  if (item.type === 'video') {
    const provider = item.provider ?? (item.src.includes('youtu') ? 'youtube' : 'file')
    if (provider === 'youtube') {
      return (
        <div className={contained ? 'absolute inset-0 p-4 sm:p-8' : 'absolute inset-0'}>
          <iframe
            src={`${youtubeEmbedUrl(item.src)}${autoPlayVideo ? '&autoplay=1' : ''}`}
            title={item.label ?? `${title} — vídeo`}
            className="w-full h-full border-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    return (
      <div className={contained ? 'absolute inset-0 flex items-center justify-center p-4' : 'absolute inset-0'}>
        <video
          src={item.src}
          poster={item.poster}
          controls
          autoPlay={autoPlayVideo}
          className={contained ? 'max-w-full max-h-full' : 'w-full h-full object-contain bg-black'}
        />
      </div>
    )
  }

  if (contained) {
    return (
      <Image
        src={item.src}
        alt={`${title} — ${index + 1}/${total}`}
        fill
        className="object-contain p-4"
        sizes="100vw"
        priority
      />
    )
  }

  return (
    <button type="button" className="absolute inset-0" onClick={onOpen} aria-label="Ampliar">
      <Image
        src={item.src}
        alt={`${title} — ${index + 1}/${total}`}
        fill
        priority={index === 0}
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 65vw"
      />
    </button>
  )
}

function Thumb({
  item,
  active,
  onClick,
  dataThumb,
}: {
  item: MediaItem
  active: boolean
  onClick: () => void
  dataThumb: number
}) {
  return (
    <button
      type="button"
      data-thumb={dataThumb}
      onClick={onClick}
      className={`relative shrink-0 w-[72px] md:w-full aspect-[4/3] overflow-hidden ${
        active ? 'ring-2 ring-[#0e6b7a] ring-offset-1' : 'opacity-60 hover:opacity-100'
      }`}
      aria-label={item.type === 'video' ? 'Vídeo' : `Foto ${dataThumb + 1}`}
    >
      <ThumbImage item={item} sizes="112px" />
      {item.type === 'video' && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <PlayBadge small />
        </span>
      )}
    </button>
  )
}

function ThumbImage({ item, sizes }: { item: MediaItem; sizes: string }) {
  const src =
    item.type === 'image'
      ? item.src
      : item.poster || youtubeThumb(item.src) || getFakeFallback()

  return <Image src={src} alt="" fill className="object-cover" sizes={sizes} loading="lazy" />
}

function getFakeFallback() {
  return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=60'
}

function PlayBadge({ small }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-white/95 text-[#111] ${
        small ? 'w-7 h-7' : 'w-12 h-12'
      }`}
      aria-hidden
    >
      <svg width={small ? 10 : 14} height={small ? 10 : 14} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  )
}
