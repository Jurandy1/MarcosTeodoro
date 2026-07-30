import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingLayout } from '@/components/listing-layout'
import type { Property } from '@/components/property-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Imóveis para Alugar | Marcos Teodoro Corretor',
  description:
    'Imóveis para locação anual no litoral Norte de Santa Catarina. Apartamentos, coberturas e casas em Balneário Camboriú, Itapema e Porto Belo.',
}

const properties: Property[] = [
  {
    id: 'A01',
    badge: 'Frente ao mar',
    badgeVariant: 'ocean',
    gradientClass: 'g1',
    location: 'Balneário Camboriú, Barra Sul',
    city: 'Balneário Camboriú, Barra Sul',
    title: 'Cobertura frente ao mar duplex',
    bedrooms: 4,
    bathrooms: 5,
    parking: 4,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: 'A02',
    badge: 'Alto padrão',
    badgeVariant: 'dark',
    gradientClass: 'g2',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    title: 'Apartamento alto padrão Meia Praia',
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: 'A03',
    badge: 'Lançamento',
    badgeVariant: 'gold',
    gradientClass: 'g3',
    location: 'Porto Belo, Perequê',
    city: 'Porto Belo, Perequê',
    title: 'Lançamento pré obra Perequê',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: 'A04',
    badge: 'Condomínio fechado',
    badgeVariant: 'dark',
    gradientClass: 'g4',
    location: 'Balneário Camboriú',
    city: 'Balneário Camboriú',
    title: 'Casa em condomínio fechado',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: 'A05',
    badge: 'Vista para o mar',
    badgeVariant: 'ocean',
    gradientClass: 'g1',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    title: 'Apartamento vista mar',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: 'A06',
    badge: 'Exclusivo',
    badgeVariant: 'gold',
    gradientClass: 'g2',
    location: 'Balneário Camboriú, Central',
    city: 'Balneário Camboriú, Central',
    title: 'Apartamento exclusivo localização central',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: 'A07',
    badge: 'Mobiliado',
    badgeVariant: 'ocean',
    gradientClass: 'g3',
    location: 'Itapema, Centro',
    city: 'Itapema, Centro',
    title: 'Apartamento mobiliado Itapema',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 110,
    price: 'R$ 5.800/mês',
  },
  {
    id: 'A08',
    badge: '450m do mar',
    badgeVariant: 'dark',
    gradientClass: 'g4',
    location: 'Porto Belo, Perequê',
    city: 'Porto Belo, Perequê',
    title: 'Casa com área gourmet e piscina',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: 280,
    price: 'R$ 8.500/mês',
  },
]

export default function AluguelPage() {
  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <ListingLayout
          title="Imóveis para"
          titleEm="alugar"
          subtitle="Locação anual no litoral Norte de SC"
          properties={properties}
          mode="aluguel"
        />
      </main>
      <SiteFooter />
    </>
  )
}
