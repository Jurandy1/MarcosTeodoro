import type { Property } from '@/components/property-card'
import type { MediaItem } from '@/lib/property-images'
import { buildFakeImageList } from '@/lib/property-images'

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
  entrada?: string
  parcelamento?: string
  unitFeatures?: string[]
  amenities?: string[]
  address?: string
  /** Galeria de fotos (suporta 60+) */
  images?: string[]
  /** Vídeos do imóvel (arquivo, YouTube ou Vimeo) */
  videos?: Extract<MediaItem, { type: 'video' }>[]
  /** Coordenadas para o mapa */
  lat?: number
  lng?: number
  /** valor numérico para ordenar/filtrar (sem R$) */
  priceValue?: number
}

export const CITY_FILTERS = [
  'Balneário Camboriú',
  'Itapema',
  'Porto Belo',
  'Bombinhas',
  'Itajaí',
] as const

export const properties: CatalogProperty[] = [
  {
    id: 'atlantic-paradise',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Destaque',
    badgeVariant: 'gold',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    cityKey: 'Itapema',
    title: 'Atlantic Paradise',
    unitName: 'Atlantic Paradise',
    bedrooms: 4,
    bathrooms: 5,
    suites: 4,
    parking: 3,
    area: 281,
    areaPrivate: 281,
    areaTotal: 362,
    price: 'R$ 13.420.000,00',
    priceValue: 13420000,
    entrada: 'R$ 5.368.000,00',
    parcelamento: '48 x R$ 167.750,00',
    address: 'Avenida Nereu Ramos 5055, Itapema/SC',
    lat: -27.0909,
    lng: -48.6111,
    // Demonstra galeria com muitas fotos (60+)
    images: buildFakeImageList('atlantic-paradise', 64),
    videos: [
      {
        type: 'video',
        provider: 'youtube',
        src: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        label: 'Tour pelo empreendimento',
      },
    ],
    unitFeatures: [
      'Home Office',
      'Living',
      'Lavabo',
      'Cozinha',
      'Área de Serviço',
      'Banheiro de Serviço',
      'Infraestrutura para água quente',
      'Espera para split',
      'Acabamento em gesso',
      'Fechadura com senha na porta de entrada',
      'Churrasqueira',
      'Dependência de empregada',
      'Piso aquecido nos banheiros',
      'Porcelanato',
      'Hidromassagem',
      'Ar Condicionado',
      'Armário Embutido',
      'Acessibilidade para PNE',
      'Banheira Hidromassagem',
      'Hidrômetro Individual',
      'Sacada',
      'Closet',
      'Despensa',
      'Sala de Estar',
      'Alarme',
      'Interfone',
      'Circuito Tv',
      'Varanda',
      'Sala de jantar',
      'Cozinha Americana',
      'Banheiro Social',
      'Varanda Gourmet',
      'Vista Panorâmica',
      'Internet',
      'Gás Individual',
      'Móveis Planejados',
      'Armário Cozinha',
      'Aquecimento a Gás',
    ],
    amenities: [
      'Piscina infantil',
      'Hidromassagem na piscina',
      'Piscina térmica',
      'Academia',
      'Sala de jogos',
      'Playground',
      'Sala de Reunião',
      'Spa',
      'Sauna',
      'Salão de festas',
      'Lounge',
      'Solarium',
      'Guarita de segurança',
      'Bicicletário',
      'Entrada p/ banhistas e box de praia',
      'Hall de entrada decorado e mobiliado',
      'Medidores de água, luz e gás individuais',
      'Piscina adulto com borda infinita',
      'Pub',
      'Hidromassagem',
      'Reaproveitamento de água',
      'Sala de games',
      'Brinquedoteca',
      'Elevador',
      'Espaço gourmet',
      'Interfone',
      'Alarme',
      'Piscina',
      'Internet',
      'Jacuzzi',
      'Estar Social',
      'Circuito Tv',
      'Piscina adulto',
    ],
  },
  {
    id: '1024',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Vista para o mar',
    location: 'Balneário Camboriú, Central',
    city: 'Balneário Camboriú, Central',
    cityKey: 'Balneário Camboriú',
    title: 'Apartamento no Edifício Horizonte',
    bedrooms: 4,
    bathrooms: 5,
    suites: 3,
    parking: 3,
    area: 210,
    areaPrivate: 210,
    price: 'R$ 4.450.000',
    priceValue: 4450000,
    address: 'Balneário Camboriú, Centro, SC',
  },
  {
    id: '1019',
    kind: 'casa',
    mode: 'venda',
    badge: 'Mobiliado',
    location: 'Itajaí, Praia Brava',
    city: 'Itajaí, Praia Brava',
    cityKey: 'Itajaí',
    title: 'Casa em condomínio no Reserva Brava',
    bedrooms: 5,
    bathrooms: 6,
    suites: 4,
    parking: 4,
    area: 480,
    areaPrivate: 480,
    price: 'R$ 7.500.000',
    priceValue: 7500000,
    address: 'Praia Brava, Itajaí/SC',
  },
  {
    id: '1008',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Lançamento',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    cityKey: 'Itapema',
    title: 'Edifício Aquamarine Residence',
    bedrooms: 3,
    bathrooms: 4,
    suites: 2,
    parking: 2,
    area: 172,
    areaPrivate: 172,
    price: 'R$ 4.500.000',
    priceValue: 4500000,
    address: 'Meia Praia, Itapema/SC',
  },
  {
    id: '1002',
    kind: 'casa',
    mode: 'venda',
    badge: 'Condomínio',
    location: 'Porto Belo, Perequê',
    city: 'Porto Belo, Perequê',
    cityKey: 'Porto Belo',
    title: 'Sobrado no Costa Verde Perequê',
    bedrooms: 4,
    bathrooms: 5,
    suites: 3,
    parking: 3,
    area: 310,
    areaPrivate: 310,
    price: 'R$ 3.200.000',
    priceValue: 3200000,
    address: 'Perequê, Porto Belo/SC',
  },
  {
    id: '1005',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Frente ao mar',
    location: 'Balneário Camboriú, Barra Sul',
    city: 'Balneário Camboriú, Barra Sul',
    cityKey: 'Balneário Camboriú',
    title: 'Cobertura frente ao mar Barra Sul',
    bedrooms: 4,
    bathrooms: 5,
    suites: 4,
    parking: 4,
    area: 280,
    areaPrivate: 280,
    price: 'Sob consulta',
    address: 'Barra Sul, Balneário Camboriú/SC',
  },
  {
    id: '1012',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Alto padrão',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    cityKey: 'Itapema',
    title: 'Apartamento alto padrão Meia Praia',
    bedrooms: 3,
    bathrooms: 4,
    suites: 2,
    parking: 2,
    area: 165,
    areaPrivate: 165,
    price: 'R$ 3.890.000',
    priceValue: 3890000,
    address: 'Meia Praia, Itapema/SC',
  },
  {
    id: '1015',
    kind: 'casa',
    mode: 'venda',
    badge: 'Frente ao mar',
    location: 'Bombinhas, Mariscal',
    city: 'Bombinhas, Mariscal',
    cityKey: 'Bombinhas',
    title: 'Casa de praia em Mariscal',
    bedrooms: 4,
    bathrooms: 4,
    suites: 3,
    parking: 3,
    area: 260,
    areaPrivate: 260,
    price: 'R$ 2.950.000',
    priceValue: 2950000,
    address: 'Mariscal, Bombinhas/SC',
  },
  {
    id: '2001',
    kind: 'apartamento',
    mode: 'aluguel',
    badge: 'Frente ao mar',
    location: 'Balneário Camboriú, Barra Sul',
    city: 'Balneário Camboriú, Barra Sul',
    cityKey: 'Balneário Camboriú',
    title: 'Cobertura frente ao mar duplex',
    bedrooms: 4,
    bathrooms: 5,
    parking: 4,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: '2002',
    kind: 'apartamento',
    mode: 'aluguel',
    badge: 'Alto padrão',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    cityKey: 'Itapema',
    title: 'Apartamento alto padrão',
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: '2004',
    kind: 'casa',
    mode: 'aluguel',
    badge: 'Exclusivo',
    location: 'Balneário Camboriú',
    city: 'Balneário Camboriú',
    cityKey: 'Balneário Camboriú',
    title: 'Casa em condomínio fechado',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: 'A07',
    kind: 'apartamento',
    mode: 'aluguel',
    badge: 'Mobiliado',
    location: 'Itapema, Centro',
    city: 'Itapema, Centro',
    cityKey: 'Itapema',
    title: 'Apartamento mobiliado Itapema',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 110,
    price: 'R$ 5.800/mês',
    priceValue: 5800,
  },
  {
    id: 'A08',
    kind: 'casa',
    mode: 'aluguel',
    badge: '450m do mar',
    location: 'Porto Belo, Perequê',
    city: 'Porto Belo, Perequê',
    cityKey: 'Porto Belo',
    title: 'Casa com área gourmet e piscina',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: 280,
    price: 'R$ 8.500/mês',
    priceValue: 8500,
  },
]

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
