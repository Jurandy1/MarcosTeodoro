/** Tipos e helpers de mídia (fotos em massa + vídeo) */

export type MediaItem =
  | { type: 'image'; src: string; alt?: string }
  | {
      type: 'video'
      /** URL do arquivo mp4 ou ID/URL do YouTube/Vimeo */
      src: string
      poster?: string
      provider?: 'file' | 'youtube' | 'vimeo'
      label?: string
    }

export const FAKE_PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d367e6?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80',
]

function hashId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % 997
  return hash
}

export function getFakePropertyImage(id: string, explicit?: string) {
  if (explicit) return explicit
  return FAKE_PROPERTY_IMAGES[hashId(id) % FAKE_PROPERTY_IMAGES.length]
}

/** Gera N fotos fake (suporta 60+) reutilizando o banco de imagens */
export function buildFakeImageList(id: string, count: number, cover?: string): string[] {
  const start = hashId(id) % FAKE_PROPERTY_IMAGES.length
  const list: string[] = []
  for (let i = 0; i < count; i++) {
    list.push(FAKE_PROPERTY_IMAGES[(start + i) % FAKE_PROPERTY_IMAGES.length])
  }
  if (cover) list[0] = cover
  return list
}

export function getPropertyGallery(
  id: string,
  images?: string[],
  cover?: string,
  count = 12,
) {
  if (images && images.length > 0) {
    return cover && !images.includes(cover) ? [cover, ...images] : [...images]
  }
  return buildFakeImageList(id, count, cover)
}

export function youtubeEmbedUrl(src: string) {
  if (src.includes('youtube.com/embed/')) return src
  const idMatch =
    src.match(/youtu\.be\/([^?&]+)/)?.[1] ||
    src.match(/[?&]v=([^?&]+)/)?.[1] ||
    src.match(/youtube\.com\/shorts\/([^?&]+)/)?.[1] ||
    (!src.includes('/') && !src.includes('.') ? src : null)
  if (!idMatch) return src
  return `https://www.youtube.com/embed/${idMatch}?rel=0`
}

export function youtubeThumb(src: string) {
  const idMatch =
    src.match(/youtu\.be\/([^?&]+)/)?.[1] ||
    src.match(/[?&]v=([^?&]+)/)?.[1] ||
    src.match(/embed\/([^?&]+)/)?.[1] ||
    src.match(/shorts\/([^?&]+)/)?.[1] ||
    (!src.includes('/') && !src.includes('.') ? src : null)
  if (!idMatch) return undefined
  return `https://i.ytimg.com/vi/${idMatch}/hqdefault.jpg`
}

export function mapsEmbedUrl(opts: {
  lat?: number
  lng?: number
  address?: string
}) {
  if (opts.lat != null && opts.lng != null) {
    return `https://maps.google.com/maps?q=${opts.lat},${opts.lng}&z=15&output=embed`
  }
  if (opts.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(opts.address)}&z=15&output=embed`
  }
  return null
}

export function mapsExternalUrl(opts: {
  lat?: number
  lng?: number
  address?: string
}) {
  if (opts.lat != null && opts.lng != null) {
    return `https://www.google.com/maps?q=${opts.lat},${opts.lng}`
  }
  if (opts.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opts.address)}`
  }
  return null
}

/** Une fotos + vídeos em uma lista única de mídia */
export function buildMediaItems(opts: {
  id: string
  images?: string[]
  cover?: string
  videos?: MediaItem[]
  /** se não houver images, gera esta quantidade de fotos fake */
  fakeCount?: number
}): MediaItem[] {
  const photos = getPropertyGallery(opts.id, opts.images, opts.cover, opts.fakeCount ?? 12)
  const items: MediaItem[] = photos.map((src) => ({ type: 'image', src }))

  if (opts.videos?.length) {
    // Vídeos no início (após a capa) — padrão de portais imobiliários
    const videos = opts.videos.map((v) =>
      v.type === 'video'
        ? v
        : ({ type: 'video', src: String((v as { src?: string }).src ?? '') } as MediaItem),
    )
    const cover = items[0]
    const rest = items.slice(1)
    return [cover, ...videos, ...rest].filter(Boolean)
  }

  return items
}
