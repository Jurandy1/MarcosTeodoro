import { notFound } from 'next/navigation'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PropertyDetailView } from '@/components/property-detail'
import {
  fetchPublicProperties,
  fetchPublicProperty,
} from '@/lib/supabase/public-properties'
import type { Metadata } from 'next'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const property = await fetchPublicProperty(id)
  if (!property) return { title: 'Imóvel não encontrado' }
  const path = `/vendas/${id}`
  return {
    title: `${property.title} | Marcos Teodoro`,
    description: `${property.city} · ${property.bedrooms} dorm · ${property.price}`,
    alternates: { canonical: path },
    openGraph: {
      title: property.title,
      description: `${property.city} · ${property.price}`,
      url: path,
      type: 'article',
      images: property.image ? [{ url: property.image }] : undefined,
    },
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  const property = await fetchPublicProperty(id)
  if (!property || property.mode !== 'venda') notFound()

  const similar = (await fetchPublicProperties('venda'))
    .filter((p) => p.id !== property.id && p.kind === property.kind)
    .slice(0, 4)

  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <PropertyDetailView property={property} mode="venda" similar={similar} />
      </main>
      <SiteFooter />
    </>
  )
}
