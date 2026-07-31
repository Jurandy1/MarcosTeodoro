import { Suspense } from 'react'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingLayout } from '@/components/listing-layout'
import { getPropertiesByMode } from '@/lib/properties'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Imóveis para Alugar | Marcos Teodoro',
  description:
    'Imóveis para locação anual no litoral Norte de Santa Catarina. Apartamentos e casas em Balneário Camboriú, Itapema e Porto Belo.',
}

export default function AluguelPage() {
  const properties = getPropertiesByMode('aluguel')

  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <Suspense fallback={<div className="py-16 text-center text-[#6f7680]">Carregando imóveis...</div>}>
          <ListingLayout
            title="Imóveis para"
            titleEm="alugar"
            subtitle="Locação anual no litoral"
            properties={properties}
            mode="aluguel"
          />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
