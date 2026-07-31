import { notFound } from 'next/navigation'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PropertyDetailView } from '@/components/property-detail'
import { getPropertyById } from '@/lib/properties'
import type { Metadata } from 'next'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const property = getPropertyById(id)
  if (!property) return { title: 'Imóvel não encontrado' }
  return {
    title: `${property.title} | Marcos Teodoro`,
    description: `${property.city} · ${property.bedrooms} dorm · ${property.price}`,
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  const property = getPropertyById(id)
  if (!property || property.mode !== 'venda') notFound()

  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <PropertyDetailView property={property} mode="venda" />
      </main>
      <SiteFooter />
    </>
  )
}
