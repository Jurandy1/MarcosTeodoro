import Image from 'next/image'
import Link from 'next/link'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BrokerStrip } from '@/components/broker-strip'
import { AutoScrollRow } from '@/components/auto-scroll-row'
import { getPropertiesByMode } from '@/lib/properties'

const MARCOS_PHOTO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amrcos-AyeiWeXupJzq8ST9I0UpYvAXaaRlPf.jpg'

export default function HomePage() {
  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <HeroSection />
        <PropertiesCarousel />
        <BrokerStrip />
      </main>
      <SiteFooter />
    </>
  )
}

function HeroSection() {
  return (
    <section id="sobre" className="relative text-white overflow-hidden" style={{ background: '#0b1420' }}>
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/hero-litoral.jpg"
          alt=""
          fill
          quality={80}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg,rgba(14,107,122,.55) 0%,rgba(11,20,32,.45) 45%,rgba(11,20,32,.2) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_380px] items-end gap-6 md:gap-10 lg:gap-12 pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-14 lg:pb-16">
        <div className="order-2 md:order-1 pb-1">
          <div className="anim-1 text-[#c9a35a] text-[0.72rem] sm:text-[0.62rem] font-semibold tracking-[.16em] sm:tracking-[.2em] uppercase mb-2.5 sm:mb-3">
            Consultor imobiliário | CRECI SC 71914
          </div>
          <h1 className="anim-2 font-serif text-[2.1rem] sm:text-[2.75rem] lg:text-[3.1rem] font-medium leading-[1.08] tracking-tight mb-3">
            Marcos <span className="text-[#c9a35a]">Teodoro</span>
          </h1>
          <p className="anim-3 text-[#c8ccd1] text-[0.95rem] sm:text-[0.92rem] leading-relaxed max-w-[46ch] mb-3">
            Seu patrimônio merece mais do que uma venda.
            <br />
            Ele merece uma boa decisão.
          </p>
          <p className="anim-3 text-[#c8ccd1]/90 text-[0.9rem] sm:text-[0.9rem] leading-relaxed max-w-[46ch]">
            Especialista em imóveis de alto padrão no litoral norte de Santa Catarina, ajudando
            famílias e investidores a escolher imóveis com segurança, estratégia e confiança.
          </p>
        </div>

        <div className="order-1 md:order-2 flex justify-center md:justify-end">
          <div className="relative w-[min(260px,72vw)] sm:w-[min(300px,68vw)] md:w-full max-w-[360px]">
            <div
              className="absolute -inset-2 rounded-2xl border border-[#c9a35a]/40"
              style={{ transform: 'translate(8px, 8px)' }}
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_28px_60px_rgba(0,0,0,.5)] ring-1 ring-white/10">
              <Image
                src={MARCOS_PHOTO}
                alt="Marcos Teodoro, Consultor Imobiliário"
                fill
                className="object-cover object-[center_18%]"
                priority
                quality={85}
                sizes="(max-width: 768px) 72vw, (max-width: 1024px) 320px, 360px"
              />
              <div
                className="absolute inset-x-0 bottom-0 p-4 pt-16"
                style={{ background: 'linear-gradient(transparent,rgba(11,20,32,.9))' }}
              >
                <div className="text-[0.72rem] sm:text-[0.68rem] font-semibold tracking-[.12em] uppercase text-white mb-1.5 leading-snug drop-shadow-[0_2px_6px_rgba(0,0,0,.75)]">
                  &ldquo;O extraordinário não precisa de apresentação&rdquo;
                </div>
                <div className="font-serif text-[0.95rem] font-medium text-white">
                  Marcos Teodoro
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PropertiesCarousel() {
  const sale = getPropertiesByMode('venda')
  const apartments = sale.filter((p) => p.kind === 'apartamento')
  const houses = sale.filter((p) => p.kind === 'casa')

  return (
    <section className="bg-[#f7f5f1] border-y border-[#ebe8e2] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-5 sm:pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-[1.35rem] sm:text-[1.55rem] text-[#0b1420] leading-tight">
              Imóveis no litoral
            </h2>
            <p className="mt-1 text-[0.82rem] sm:text-[0.78rem] text-[#6f7680]">
              Balneário Camboriú, Itapema, Porto Belo e Bombinhas
            </p>
          </div>
          <Link
            href="/vendas"
            className="hidden sm:inline text-[0.65rem] font-semibold tracking-[.12em] uppercase text-[#0e6b7a] hover:text-[#095260] transition-colors"
          >
            Ver todos
          </Link>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 pb-8 sm:pb-11">
        <AutoScrollRow
          id="apartamentos"
          title="Apartamentos"
          href="/vendas?tipo=apartamento"
          properties={apartments}
        />
        <AutoScrollRow
          id="casas"
          title="Casas"
          href="/vendas?tipo=casa"
          properties={houses}
          reverse
        />
      </div>
    </section>
  )
}
