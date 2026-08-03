import type { Metadata } from 'next'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BrokerStrip } from '@/components/broker-strip'
import { getPublicSiteSettings, whatsappUrl } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Contato | Marcos Teodoro',
  description:
    'Fale com Marcos Teodoro ou um consultor da equipe. Atendimento pelo WhatsApp para imóveis no litoral de SC.',
  alternates: { canonical: '/contato' },
  openGraph: {
    title: 'Contato | Marcos Teodoro',
    url: '/contato',
    type: 'website',
  },
}

export default async function ContatoPage() {
  const settings = await getPublicSiteSettings()
  const wa = whatsappUrl(settings.whatsapp, 'Olá, tenho interesse em imóveis no litoral.')

  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <section className="bg-[#f7f5f1] border-b border-[#ebe8e2]">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <p className="text-[0.68rem] font-semibold tracking-[.16em] uppercase text-[#0e6b7a] mb-3">
              Atendimento
            </p>
            <h1 className="font-serif text-[2rem] sm:text-[2.4rem] text-[#0b1420] leading-tight mb-3">
              Contato
            </h1>
            <p className="text-[0.95rem] text-[#4a5560] max-w-[48ch]">
              Escolha a cidade e a faixa de investimento para ser direcionado ao consultor certo —
              ou fale direto pelo WhatsApp.
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-5 min-h-[42px] items-center px-4 bg-[#25d366] text-white text-[0.68rem] font-semibold tracking-[.1em] uppercase hover:opacity-90"
            >
              WhatsApp direto
            </a>
          </div>
        </section>
        <BrokerStrip defaultWhatsapp={settings.whatsapp} />
      </main>
      <SiteFooter />
    </>
  )
}
