import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const MARCOS_PHOTO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amrcos-AyeiWeXupJzq8ST9I0UpYvAXaaRlPf.jpg'

export const metadata: Metadata = {
  title: 'Sobre | Marcos Teodoro',
  description:
    'Conheça Marcos Teodoro, consultor imobiliário CRECI SC 71914, especialista em imóveis de alto padrão no litoral norte de Santa Catarina.',
  alternates: { canonical: '/sobre' },
  openGraph: {
    title: 'Sobre Marcos Teodoro',
    url: '/sobre',
    type: 'website',
  },
}

export default function SobrePage() {
  return (
    <>
      <Topbar />
      <SiteHeader />
      <main className="bg-[#f7f5f1]">
        <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="text-[0.68rem] font-semibold tracking-[.16em] uppercase text-[#0e6b7a] mb-3">
            Consultor imobiliário · CRECI SC 71914
          </p>
          <h1 className="font-serif text-[2rem] sm:text-[2.4rem] text-[#0b1420] leading-tight mb-6">
            Sobre Marcos Teodoro
          </h1>

          <div className="grid md:grid-cols-[220px_1fr] gap-8 items-start">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#ece9e3]">
              <Image
                src={MARCOS_PHOTO}
                alt="Marcos Teodoro"
                fill
                className="object-cover object-[center_18%]"
                sizes="220px"
              />
            </div>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-[#4a5560]">
              <p className="text-[1.05rem] text-[#0b1420] font-medium">
                Seu patrimônio merece mais do que uma venda.
                <br />
                Ele merece uma boa decisão.
              </p>
              <p>
                Especialista em imóveis de alto padrão no litoral norte de Santa Catarina, ajudando
                famílias e investidores a escolher imóveis com segurança, estratégia e confiança.
              </p>
              <p>
                Atuação em Balneário Camboriú, Itapema, Porto Belo e Bombinhas — com acompanhamento
                próximo em cada etapa da compra ou locação.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/vendas"
                  className="inline-flex min-h-[42px] items-center px-4 bg-[#0b1420] text-white text-[0.68rem] font-semibold tracking-[.1em] uppercase hover:bg-[#162033]"
                >
                  Ver imóveis
                </Link>
                <Link
                  href="/contato"
                  className="inline-flex min-h-[42px] items-center px-4 border border-[#0e6b7a] text-[#0e6b7a] text-[0.68rem] font-semibold tracking-[.1em] uppercase hover:bg-[#e8f4f6]"
                >
                  Falar comigo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
