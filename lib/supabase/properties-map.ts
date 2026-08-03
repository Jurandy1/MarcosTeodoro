import type { AdminProperty } from '@/lib/admin-store'
import type { CatalogProperty } from '@/lib/properties'
import type { StoredImage } from '@/lib/storage'
import { storageUrl, storageUrls } from '@/lib/storage'
import {
  distinctUnidade,
  formatPropertyTitle,
  resolvePropertyTitle,
} from '@/lib/property-title'

export type PropertyRow = {
  id: string
  kind: 'apartamento' | 'casa'
  mode: 'venda' | 'aluguel'
  status: 'rascunho' | 'pronto'
  badge: string | null
  badge_variant: string | null
  location: string
  city: string
  city_key: string
  title: string
  unit_name: string | null
  empreendimento: string | null
  unidade: string | null
  bedrooms: number
  bathrooms: number
  suites: number | null
  parking: number
  area: number
  area_private: number | null
  area_total: number | null
  price: string
  price_value: number | null
  entrada: string | null
  reforco: string | null
  parcelamento: string | null
  unit_features: string[]
  amenities: string[]
  address: string | null
  cep: string | null
  source_url: string | null
  lat: number | null
  lng: number | null
  /** @deprecated legado — não gravar URL completa */
  cover_url?: string | null
  cover_path?: string | null
  /** @deprecated legado */
  images?: string[]
  videos: unknown[]
  is_featured?: boolean
  featured_order?: number
  created_at: string
  updated_at: string
}

export type PropertyImageRow = {
  id: string
  property_id: string
  path: string
  width: number
  height: number
  size_bytes: number
  mime_type: string
  sort_order: number
}

export function toRow(p: AdminProperty): Omit<PropertyRow, 'images' | 'cover_url'> {
  const assets = p.imageAssets ?? []
  const coverPath = p.coverPath || assets[0]?.path || null
  const emp = (p.empreendimento || p.unitName || p.title || '').trim()
  const und = distinctUnidade(emp, p.unidade)
  const title = formatPropertyTitle(emp, und) || resolvePropertyTitle(p)
  return {
    id: p.id,
    kind: p.kind,
    mode: p.mode,
    status: p.status,
    badge: p.badge ?? null,
    badge_variant: p.badgeVariant ?? null,
    location: p.location,
    city: p.city,
    city_key: p.cityKey,
    title,
    unit_name: emp || null,
    empreendimento: emp || null,
    unidade: und ?? null,
    bedrooms: Number(p.bedrooms) || 0,
    bathrooms: Number(p.bathrooms) || 0,
    suites: p.suites ?? null,
    parking: Number(p.parking) || 0,
    area: Number(p.area) || 0,
    area_private: p.areaPrivate ?? null,
    area_total: p.areaTotal ?? null,
    price: p.price,
    price_value: p.priceValue ?? null,
    entrada: p.entrada ?? null,
    reforco: p.reforco ?? null,
    parcelamento: p.parcelamento ?? null,
    unit_features: p.unitFeatures ?? [],
    amenities: p.amenities ?? [],
    address: p.address ?? null,
    cep: p.cep ?? null,
    source_url: p.sourceUrl ?? null,
    lat: p.lat ?? null,
    lng: p.lng ?? null,
    cover_path: coverPath,
    videos: p.videos ?? [],
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }
}

export function assetsFromRows(rows: PropertyImageRow[]): StoredImage[] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => ({
      path: r.path,
      width: r.width,
      height: r.height,
      sizeBytes: r.size_bytes,
      mimeType: r.mime_type,
    }))
}

export function fromRow(row: PropertyRow, imageRows: PropertyImageRow[] = []): AdminProperty {
  const assets =
    imageRows.length > 0
      ? assetsFromRows(imageRows)
      : // legado: se images[] tiver paths relativos
        (row.images ?? [])
          .filter((p) => p && !p.startsWith('http') && !p.startsWith('data:'))
          .map((path) => ({
            path,
            width: 0,
            height: 0,
            sizeBytes: 0,
            mimeType: 'image/webp',
          }))

  const coverPath =
    row.cover_path ||
    assets[0]?.path ||
    (row.cover_url && !row.cover_url.startsWith('http') ? row.cover_url : undefined)

  const resolvedUrls =
    assets.length > 0
      ? storageUrls(assets)
      : storageUrls(row.images).length
        ? storageUrls(row.images)
        : row.cover_url
          ? [row.cover_url]
          : []

  const emp = (row.empreendimento || row.unit_name || '').trim()
  const und = distinctUnidade(emp, row.unidade)
  const title = resolvePropertyTitle({
    title: row.title,
    empreendimento: emp,
    unitName: row.unit_name,
    unidade: und,
  })

  return {
    id: row.id,
    kind: row.kind,
    mode: row.mode,
    status: row.status,
    badge: row.badge ?? undefined,
    badgeVariant: (row.badge_variant as AdminProperty['badgeVariant']) ?? undefined,
    location: row.location,
    city: row.city,
    cityKey: row.city_key,
    title,
    unitName: emp || title,
    empreendimento: emp || undefined,
    unidade: und,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    suites: row.suites ?? undefined,
    parking: row.parking,
    area: row.area,
    areaPrivate: row.area_private ?? undefined,
    areaTotal: row.area_total ?? undefined,
    price: row.price,
    priceValue: row.price_value ?? undefined,
    entrada: row.entrada ?? undefined,
    reforco: row.reforco ?? undefined,
    parcelamento: row.parcelamento ?? undefined,
    unitFeatures: row.unit_features ?? [],
    amenities: row.amenities ?? [],
    address: row.address ?? undefined,
    cep: row.cep ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    coverPath: coverPath ?? undefined,
    imageAssets: assets,
    image: coverPath ? storageUrl(coverPath) : resolvedUrls[0],
    images: resolvedUrls,
    videos: (row.videos as CatalogProperty['videos']) ?? undefined,
    isFeatured: row.is_featured ?? false,
    featuredOrder: row.featured_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** @deprecated */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',')
  const mime = meta.match(/data:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export function isDataUrl(src: string) {
  return src.startsWith('data:')
}
