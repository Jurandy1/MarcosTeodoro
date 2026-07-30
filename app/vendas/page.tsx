import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingLayout } from '@/components/listing-layout'
import type { Property } from '@/components/property-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Imóveis à Venda | Marcos Teodoro Corretor',
  description:
    'Imóveis à venda no litoral de Santa Catarina: Balneário Camboriú, Itapema e Porto Belo. Apartamentos frente ao mar, casas em condomínio, coberturas e lançamentos.',
}

const properties: Property[] = [
  {
    id: '01',
    badge: 'Frente ao mar',
    badgeVariant: 'ocean',
    gradientClass: 'g1',
    location: 'Balneário Camboriú, Barra Sul',
    city: 'Balneário Camboriú, Barra Sul',
    title: 'Cobertura frente ao mar Barra Sul',
    bedrooms: 4,
    bathrooms: 5,
    parking: 4,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: '02',
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
    id: '03',
    badge: 'Lançamento',
    badgeVariant: 'gold',
    gradientClass: 'g1',
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
    id: '04',
    badge: 'Condomínio fechado',
    badgeVariant: 'dark',
    gradientClass: 'g4',
    location: 'Balneário Camboriú',
    city: 'Balneário Camboriú',
    title: 'Casa em condomínio fechado BC',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: '05',
    badge: 'Vista para o mar',
    badgeVariant: 'ocean',
    gradientClass: 'g3',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    title: 'Apartamento vista mar Itapema',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: '06',
    badge: 'Exclusivo',
    badgeVariant: 'gold',
    gradientClass: 'g1',
    location: 'Balneário Camboriú, Central',
    city: 'Balneário Camboriú, Central',
    title: 'Apartamento exclusivo no Edifício Horizonte',
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    area: 210,
    price: 'R$ 4.450.000',
  },
  {
    id: '07',
    badge: 'Mobiliado',
    badgeVariant: 'dark',
    gradientClass: 'g2',
    location: 'Itajaí, Praia Brava',
    city: 'Itajaí, Praia Brava',
    title: 'Casa condomínio Reserva Brava',
    bedrooms: 5,
    bathrooms: 6,
    parking: 4,
    area: 480,
    price: 'R$ 7.500.000',
  },
  {
    id: '08',
    badge: 'Lançamento',
    badgeVariant: 'gold',
    gradientClass: 'g4',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    title: 'Edifício Aquamarine Residence',
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    area: 172,
    price: 'R$ 4.500.000',
  },
  {
    id: '09',
    badge: 'Condomínio',
    badgeVariant: 'dark',
    gradientClass: 'g3',
    location: 'Porto Belo, Perequê',
    city: 'Porto Belo, Perequê',
    title: 'Sobrado no Costa Verde Perequê',
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    area: 310,
    price: 'R$ 3.200.000',
  },
]

export default function VendasPage() {
  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <ListingLayout
          title="Imóveis à"
          titleEm="venda"
          subtitle="Portfólio curado por Marcos Teodoro"
          properties={properties}
          mode="venda"
        />
      </main>
      <SiteFooter />
    </>
  )
}
