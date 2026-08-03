import type { Property } from '@/components/property-card'
import type { MediaItem } from '@/lib/property-images'

export type PropertyKind = 'apartamento' | 'casa'
export type PropertyMode = 'venda' | 'aluguel'

export interface CatalogProperty extends Property {
  kind: PropertyKind
  mode: PropertyMode
  cityKey: string
  suites?: number
  areaPrivate?: number
  areaTotal?: number
  unitName?: string
  /** Nome do empreendimento / condomínio */
  empreendimento?: string
  /** Identificação da unidade (apto, torre…) */
  unidade?: string
  entrada?: string
  /** Ex.: 6 x R$ 165.992,16 */
  reforco?: string
  parcelamento?: string
  unitFeatures?: string[]
  amenities?: string[]
  address?: string
  /** CEP do imóvel */
  cep?: string
  /** Link original (DWV / landing) */
  sourceUrl?: string
  /** Path relativo da capa no storage (agnóstico ao provider) */
  coverPath?: string
  /** Fotos com path relativo + metadata */
  imageAssets?: import('@/lib/storage').StoredImage[]
  /** Galeria de fotos — URLs absolutas (demo) ou resolvidas no front */
  images?: string[]
  /** Vídeos do imóvel (arquivo, YouTube ou Vimeo) */
  videos?: Extract<MediaItem, { type: 'video' }>[]
  /** Coordenadas para o mapa */
  lat?: number
  lng?: number
  /** valor numérico para ordenar/filtrar (sem R$) */
  priceValue?: number
  /** Texto livre “Sobre o imóvel” */
  description?: string
  isFeatured?: boolean
  featuredOrder?: number
  createdAt?: string
  updatedAt?: string
}

export const CITY_FILTERS = [
  'Balneário Camboriú',
  'Itapema',
  'Porto Belo',
  'Bombinhas',
  'Itajaí',
] as const

/** Catálogo público — preenchido pelo painel/Supabase (sem imóveis fake). */
export const properties: CatalogProperty[] = []

export function getPropertiesByMode(mode: PropertyMode) {
  return properties.filter((p) => p.mode === mode)
}

export function getPropertyById(id: string) {
  return properties.find((p) => p.id === id)
}

export function filterProperties(
  list: CatalogProperty[],
  opts: {
    kind?: PropertyKind | null
    city?: string | null
    bedroomsMin?: number | null
    bathroomsMin?: number | null
    priceMax?: number | null
    q?: string | null
    sortBy?: 'recente' | 'menor' | 'maior'
  },
) {
  let result = [...list]
  const query = opts.q?.trim().toLowerCase()

  if (opts.kind) result = result.filter((p) => p.kind === opts.kind)
  if (opts.city) result = result.filter((p) => p.cityKey === opts.city)
  if (opts.bedroomsMin) {
    result = result.filter((p) => Number(p.bedrooms) >= (opts.bedroomsMin ?? 0))
  }
  if (opts.bathroomsMin) {
    result = result.filter((p) => Number(p.bathrooms) >= (opts.bathroomsMin ?? 0))
  }
  if (opts.priceMax) {
    result = result.filter(
      (p) => p.priceValue == null || p.priceValue <= (opts.priceMax ?? Number.MAX_SAFE_INTEGER),
    )
  }
  if (query) {
    result = result.filter((p) => {
      const hay = [
        p.title,
        p.unitName,
        p.city,
        p.location,
        p.address,
        p.badge,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(query)
    })
  }

  if (opts.sortBy === 'menor') {
    result.sort((a, b) => (a.priceValue ?? Number.MAX_SAFE_INTEGER) - (b.priceValue ?? Number.MAX_SAFE_INTEGER))
  } else if (opts.sortBy === 'maior') {
    result.sort((a, b) => (b.priceValue ?? 0) - (a.priceValue ?? 0))
  }

  return result
}
