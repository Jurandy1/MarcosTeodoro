import { Suspense } from 'react'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingLayout } from '@/components/listing-layout'
import { getPropertiesByMode } from '@/lib/properties'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Imóveis à Venda | Marcos Teodoro',
  description:
    'Apartamentos e casas à venda no litoral de Santa Catarina: Balneário Camboriú, Itapema, Porto Belo e Bombinhas.',
}

export default function VendasPage() {
  const properties = getPropertiesByMode('venda')

  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <Suspense fallback={<div className="py-16 text-center text-[#6f7680]">Carregando imóveis...</div>}>
          <ListingLayout
            title="Imóveis à"
            titleEm="venda"
            subtitle="Portfólio curado por Marcos Teodoro"
            properties={properties}
            mode="venda"
          />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
