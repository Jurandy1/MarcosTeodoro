import { notFound } from 'next/navigation'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PropertyDetailView } from '@/components/property-detail'
import {
  fetchPublicProperties,
  fetchPublicProperty,
} from '@/lib/supabase/public-properties'
import { buildPropertyMetadata, JsonLd, listingJsonLd } from '@/lib/seo'
import { getPublicSiteSettings } from '@/lib/site-settings'
import type { Metadata } from 'next'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const property = await fetchPublicProperty(id)
  if (!property) return { title: 'Imóvel não encontrado' }
  return buildPropertyMetadata(property, 'aluguel')
}

export default async function AluguelDetailPage({ params }: PageProps) {
  const { id } = await params
  const property = await fetchPublicProperty(id)
  if (!property || property.mode !== 'aluguel') notFound()

  const [similar, settings] = await Promise.all([
    fetchPublicProperties('aluguel').then((list) =>
      list.filter((p) => p.id !== property.id && p.kind === property.kind).slice(0, 4),
    ),
    getPublicSiteSettings(),
  ])

  return (
    <>
      <JsonLd data={listingJsonLd(property, 'aluguel')} />
      <Topbar />
      <SiteHeader />
      <main>
        <PropertyDetailView
          property={property}
          mode="aluguel"
          similar={similar}
          whatsappPhone={settings.whatsapp}
        />
      </main>
      <SiteFooter />
    </>
  )
}
