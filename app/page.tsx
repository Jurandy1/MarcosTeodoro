'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PropertyCard, type Property } from '@/components/property-card'

type PropertyKind = 'apartamento' | 'casa'

type HomeProperty = Property & { kind: PropertyKind; mode: 'venda' | 'aluguel' }

const allProperties: HomeProperty[] = [
  {
    id: '1024',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Vista para o mar',
    location: 'Balneário Camboriú, Central',
    city: 'Balneário Camboriú, Central',
    title: 'Apartamento no Edifício Horizonte',
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    area: 210,
    price: 'R$ 4.450.000',
  },
  {
    id: '1019',
    kind: 'casa',
    mode: 'venda',
    badge: 'Mobiliado',
    location: 'Itajaí, Praia Brava',
    city: 'Itajaí, Praia Brava',
    title: 'Casa em condomínio no Reserva Brava',
    bedrooms: 5,
    bathrooms: 6,
    parking: 4,
    area: 480,
    price: 'R$ 7.500.000',
  },
  {
    id: '1008',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Lançamento',
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
    id: '1002',
    kind: 'casa',
    mode: 'venda',
    badge: 'Condomínio',
    location: 'Porto Belo, Perequê',
    city: 'Porto Belo, Perequê',
    title: 'Sobrado no Costa Verde Perequê',
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    area: 310,
    price: 'R$ 3.200.000',
  },
  {
    id: '1005',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Frente ao mar',
    location: 'Balneário Camboriú, Barra Sul',
    city: 'Balneário Camboriú, Barra Sul',
    title: 'Cobertura frente ao mar Barra Sul',
    bedrooms: 4,
    bathrooms: 5,
    parking: 4,
    area: 280,
    price: 'Sob consulta',
  },
  {
    id: '1012',
    kind: 'apartamento',
    mode: 'venda',
    badge: 'Alto padrão',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    title: 'Apartamento alto padrão Meia Praia',
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    area: 165,
    price: 'R$ 3.890.000',
  },
  {
    id: '2001',
    kind: 'apartamento',
    mode: 'aluguel',
    badge: 'Frente ao mar',
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
    id: '2002',
    kind: 'apartamento',
    mode: 'aluguel',
    badge: 'Alto padrão',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    title: 'Apartamento alto padrão',
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: '2004',
    kind: 'casa',
    mode: 'aluguel',
    badge: 'Exclusivo',
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
    id: 'A07',
    kind: 'apartamento',
    mode: 'aluguel',
    badge: 'Mobiliado',
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
    kind: 'casa',
    mode: 'aluguel',
    badge: '450m do mar',
    location: 'Porto Belo, Perequê',
    city: 'Porto Belo, Perequê',
    title: 'Casa com área gourmet e piscina',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: 280,
    price: 'R$ 8.500/mês',
  },
  {
    id: '1015',
    kind: 'casa',
    mode: 'venda',
    badge: 'Frente ao mar',
    location: 'Bombinhas, Mariscal',
    city: 'Bombinhas, Mariscal',
    title: 'Casa de praia em Mariscal',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: 260,
    price: 'R$ 2.950.000',
  },
]

const MARCOS_PHOTO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amrcos-AyeiWeXupJzq8ST9I0UpYvAXaaRlPf.jpg'
const MARCOS_PHOTO_2 =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marcos-JBAkoIxvj0GDhvLLo503L00XTpnJTP.jpg'
const HERO_BG =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Balneario-Camboriu-YDWA5F7IOLzHQrpzMPiKIvILofymQH.jpg'

const WHATSAPP_BASE = 'https://wa.me/5547991594019'

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
          src={HERO_BG}
          alt=""
          fill
          className="object-cover object-[center_55%]"
          priority
          quality={90}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg,rgba(11,20,32,.92) 0%,rgba(11,20,32,.78) 42%,rgba(11,20,32,.45) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 grid lg:grid-cols-[1fr_380px] items-end gap-6 lg:gap-12 pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-14 lg:pb-16">
        <div className="order-2 lg:order-1 pb-1">
          <div className="anim-1 text-[#c9a35a] text-[0.58rem] sm:text-[0.62rem] font-semibold tracking-[.16em] sm:tracking-[.2em] uppercase mb-2.5 sm:mb-3">
            Especialista no litoral | CRECI SC 71914
          </div>
          <h1
            className="anim-2 text-[2.1rem] sm:text-[2.75rem] lg:text-[3.1rem] font-medium leading-[1.08] tracking-tight mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Marcos <span className="text-[#c9a35a]">Teodoro</span>
          </h1>
          <p className="anim-3 text-[#c8ccd1] text-[0.86rem] sm:text-[0.92rem] leading-relaxed max-w-[42ch]">
            Especialista em imóveis do litoral Norte de SC: Balneário Camboriú, Itapema,
            Porto Belo e Bombinhas. Morar ou investir, com clareza.
          </p>
        </div>

        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="relative w-[min(220px,58vw)] sm:w-[min(280px,70vw)] lg:w-full max-w-[360px]">
            <div
              className="absolute -inset-2 rounded-2xl border border-[#c9a35a]/40"
              style={{ transform: 'translate(8px, 8px)' }}
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_28px_60px_rgba(0,0,0,.5)] ring-1 ring-white/10">
              <Image
                src={MARCOS_PHOTO}
                alt="Marcos Teodoro, Corretor de Imóveis"
                fill
                className="object-cover object-[center_18%]"
                priority
                quality={90}
                sizes="(max-width: 1024px) 70vw, 360px"
              />
              <div
                className="absolute inset-x-0 bottom-0 p-4 pt-16"
                style={{ background: 'linear-gradient(transparent,rgba(11,20,32,.85))' }}
              >
                <div className="text-[0.58rem] tracking-[.18em] uppercase text-[#c9a35a] mb-0.5">
                  Seu corretor no litoral
                </div>
                <div className="text-[0.95rem] font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
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
  const apartments = allProperties.filter((p) => p.kind === 'apartamento')
  const houses = allProperties.filter((p) => p.kind === 'casa')

  return (
    <section className="bg-[#f7f5f1] border-y border-[#ebe8e2]">
      <div className="max-w-[1100px] mx-auto px-4 py-7 sm:py-9">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-7">
          <div>
            <h2
              className="text-[1.35rem] sm:text-[1.55rem] text-[#0b1420] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Imóveis no litoral
            </h2>
            <p className="mt-1 text-[0.78rem] text-[#6f7680]">
              BC, Itapema, Porto Belo e Bombinhas
            </p>
          </div>
          <Link
            href="/vendas"
            className="hidden sm:inline text-[0.65rem] font-semibold tracking-[.12em] uppercase text-[#0e6b7a] hover:text-[#095260] transition-colors"
          >
            Ver todos
          </Link>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <AutoScrollRow title="Apartamentos" href="/vendas" properties={apartments} />
          <AutoScrollRow title="Casas" href="/vendas" properties={houses} reverse />
        </div>
      </div>
    </section>
  )
}

function AutoScrollRow({
  title,
  href,
  properties,
  reverse = false,
}: {
  title: string
  href: string
  properties: HomeProperty[]
  reverse?: boolean
}) {
  const loop = [...properties, ...properties]

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <h3 className="text-[0.72rem] font-semibold tracking-[.14em] uppercase text-[#0b1420]">
          {title}
        </h3>
        <Link
          href={href}
          className="text-[0.62rem] font-medium tracking-[.08em] uppercase text-[#0e6b7a] hover:opacity-80 transition-opacity sm:hidden"
        >
          Ver
        </Link>
      </div>

      <div className="relative rounded-xl bg-white border border-[#ebe8e2] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10"
          style={{ background: 'linear-gradient(90deg,#fff 20%,transparent)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10"
          style={{ background: 'linear-gradient(270deg,#fff 20%,transparent)' }}
          aria-hidden="true"
        />

        <div className="overflow-hidden py-3">
          <div className={`auto-scroll-track ${reverse ? 'reverse' : ''}`}>
            {loop.map((p, i) => (
              <div key={`${p.id}-${i}`} className="shrink-0 w-[240px] sm:w-[270px]">
                <PropertyCard
                  compact
                  property={p}
                  href={`/${p.mode === 'venda' ? 'vendas' : 'aluguel'}/${p.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type Intent = 'morar' | 'investir' | 'alugar' | 'anunciar'
type City = 'Balneário Camboriú' | 'Itapema' | 'Porto Belo' | 'Bombinhas'

const INTENT_OPTIONS: { id: Intent; label: string; hint: string }[] = [
  { id: 'morar', label: 'Quero morar', hint: 'Encontrar meu imóvel' },
  { id: 'investir', label: 'Quero investir', hint: 'Patrimônio no litoral' },
  { id: 'alugar', label: 'Quero alugar', hint: 'Locação anual' },
  { id: 'anunciar', label: 'Quero anunciar', hint: 'Vender ou alugar meu imóvel' },
]

const KIND_OPTIONS: { id: PropertyKind | 'outro'; label: string }[] = [
  { id: 'apartamento', label: 'Apartamento' },
  { id: 'casa', label: 'Casa' },
  { id: 'outro', label: 'Cobertura ou outro' },
]

const CITY_OPTIONS: City[] = [
  'Balneário Camboriú',
  'Itapema',
  'Porto Belo',
  'Bombinhas',
]

function BrokerStrip() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [intent, setIntent] = useState<Intent | null>(null)
  const [kind, setKind] = useState<PropertyKind | 'outro' | null>(null)
  const [city, setCity] = useState<City | null>(null)

  const reset = () => {
    setStep(0)
    setIntent(null)
    setKind(null)
    setCity(null)
  }

  const close = () => {
    setOpen(false)
    reset()
  }

  const openWizard = () => {
    reset()
    setOpen(true)
  }

  const whatsappUrl = () => {
    const intentLabel = INTENT_OPTIONS.find((i) => i.id === intent)?.label ?? ''
    const kindLabel = KIND_OPTIONS.find((k) => k.id === kind)?.label ?? ''
    const text = [
      'Olá Marcos, vim pelo site.',
      `Interesse: ${intentLabel}.`,
      `Tipo: ${kindLabel}.`,
      `Cidade: ${city}.`,
      'Pode me ajudar?',
    ].join(' ')
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`
  }

  return (
    <section id="contato" className="bg-[#f7f5f1] border-t border-[#e8e6e1]">
      <div className="max-w-[1200px] mx-auto px-4 py-8 sm:py-12">
        <div className="grid md:grid-cols-[200px_1fr_auto] items-center gap-5 md:gap-8">
          <div className="relative w-[120px] sm:w-[160px] md:w-full aspect-[4/5] rounded-xl overflow-hidden mx-auto md:mx-0 shadow-[0_12px_32px_rgba(11,20,32,.12)]">
            <Image
              src={MARCOS_PHOTO_2}
              alt="Marcos Teodoro"
              fill
              className="object-cover object-[center_18%]"
              sizes="180px"
              quality={90}
            />
          </div>

          <div className="text-center md:text-left">
            <div className="text-[0.58rem] font-semibold tracking-[.16em] uppercase text-[#0e6b7a] mb-2">
              Atendimento direto
            </div>
            <h2
              className="text-[1.35rem] sm:text-[1.55rem] font-normal text-[#0b1420] mb-2 leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Fale com Marcos Teodoro
            </h2>
            <p className="text-[0.86rem] text-[#5a6069] max-w-[46ch] mx-auto md:mx-0 leading-relaxed">
              Responda algumas perguntas rápidas e seja direcionado com o atendimento certo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
            <button
              type="button"
              onClick={openWizard}
              className="inline-flex items-center justify-center bg-[#0e6b7a] text-white rounded-full px-6 py-2.5 text-[0.68rem] font-semibold tracking-[.12em] uppercase hover:bg-[#095260] transition-colors min-h-[42px] whitespace-nowrap cursor-pointer"
            >
              Falar com Marcos
            </button>
            <a
              href="https://www.instagram.com/marcosteodoro.imoveis/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-[#d9d5ce] text-[#0b1420] rounded-full px-6 py-2.5 text-[0.68rem] font-semibold tracking-[.12em] uppercase hover:border-[#0e6b7a] hover:text-[#0e6b7a] transition-colors min-h-[42px] whitespace-nowrap"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-wizard-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0b1420]/45"
            aria-label="Fechar"
            onClick={close}
          />
          <div className="relative w-full sm:max-w-[440px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="text-[0.55rem] font-semibold tracking-[.14em] uppercase text-[#0e6b7a] mb-1">
                  Passo {Math.min(step + 1, 3)} de 3
                </div>
                <h3
                  id="contact-wizard-title"
                  className="text-[1.2rem] text-[#0b1420]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {step === 0 && 'O que você deseja?'}
                  {step === 1 && 'Qual tipo de imóvel?'}
                  {step === 2 && 'Em qual cidade?'}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                className="w-9 h-9 rounded-full border border-[#e8e6e1] text-[#5a6069] hover:text-[#0b1420] transition-colors"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {step === 0 && (
              <div className="grid gap-2">
                {INTENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setIntent(opt.id)
                      setStep(1)
                    }}
                    className="text-left border border-[#e8e6e1] rounded-xl px-4 py-3 hover:border-[#0e6b7a] hover:bg-[#faf9f7] transition-colors"
                  >
                    <div className="text-[0.9rem] font-medium text-[#0b1420]">{opt.label}</div>
                    <div className="text-[0.75rem] text-[#6f7680] mt-0.5">{opt.hint}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-2">
                {KIND_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setKind(opt.id)
                      setStep(2)
                    }}
                    className="text-left border border-[#e8e6e1] rounded-xl px-4 py-3 hover:border-[#0e6b7a] hover:bg-[#faf9f7] transition-colors text-[0.9rem] font-medium text-[#0b1420]"
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="mt-2 text-[0.72rem] text-[#6f7680] hover:text-[#0e6b7a]"
                >
                  Voltar
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-2">
                {CITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCity(opt)}
                    className={`text-left border rounded-xl px-4 py-3 transition-colors text-[0.9rem] font-medium ${
                      city === opt
                        ? 'border-[#0e6b7a] bg-[#e8f4f6] text-[#0e6b7a]'
                        : 'border-[#e8e6e1] text-[#0b1420] hover:border-[#0e6b7a] hover:bg-[#faf9f7]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}

                <a
                  href={city ? whatsappUrl() : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!city}
                  onClick={(e) => {
                    if (!city) e.preventDefault()
                  }}
                  className={`mt-3 inline-flex items-center justify-center rounded-full px-6 py-3 text-[0.7rem] font-semibold tracking-[.12em] uppercase min-h-[44px] transition-colors ${
                    city
                      ? 'bg-[#0e6b7a] text-white hover:bg-[#095260]'
                      : 'bg-[#e8e6e1] text-[#9a9da2] pointer-events-none'
                  }`}
                >
                  Continuar no WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-1 text-[0.72rem] text-[#6f7680] hover:text-[#0e6b7a]"
                >
                  Voltar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
