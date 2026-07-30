'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PropertyCard, type Property } from '@/components/property-card'

const featuredProperties: Property[] = [
  {
    id: '1024',
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
]

const rentalProperties: Property[] = [
  {
    id: '2001',
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
    id: '2003',
    badge: 'Vista mar',
    location: 'Itapema, Meia Praia',
    city: 'Itapema, Meia Praia',
    title: 'Apartamento vista mar',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 'Sob consulta',
    price: 'Sob consulta',
  },
  {
    id: '2004',
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
]

const MARCOS_PHOTO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amrcos-AyeiWeXupJzq8ST9I0UpYvAXaaRlPf.jpg'
const MARCOS_PHOTO_2 =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marcos-JBAkoIxvj0GDhvLLo503L00XTpnJTP.jpg'
const HERO_BG =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Balneario-Camboriu-YDWA5F7IOLzHQrpzMPiKIvILofymQH.jpg'

export default function HomePage() {
  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <HeroSection />
        <SearchBar />
        <PropertiesSection />
        <BrokerStrip />
      </main>
      <SiteFooter />
    </>
  )
}

/* ─────────────────────────────────── HERO ─────────────────────────────────── */
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

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 grid lg:grid-cols-[1fr_380px] items-end gap-6 lg:gap-12 pt-8 pb-12 sm:pt-10 sm:pb-14 lg:pt-14 lg:pb-20">
        {/* Texto */}
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
          <p className="anim-3 text-[#c8ccd1] text-[0.86rem] sm:text-[0.92rem] leading-relaxed max-w-[42ch] mb-5 sm:mb-6">
            Especialista em imóveis do litoral Norte de SC: Balneário Camboriú, Itapema,
            Porto Belo e Bombinhas. Morar ou investir, com clareza.
          </p>
          <div className="anim-4 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
            <a
              href="https://wa.me/5547991594019?text=Olá%20Marcos%2C%20quero%20conhecer%20imóveis."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#c9a35a] text-[#0b1420] rounded-full px-6 py-3 sm:py-2.5 text-[0.68rem] font-semibold tracking-[.12em] uppercase hover:bg-[#d4b06a] transition-colors min-h-[44px] w-full sm:w-auto"
            >
              Falar com Marcos
            </a>
            <Link
              href="/vendas"
              className="inline-flex items-center justify-center border border-white/30 text-white rounded-full px-6 py-3 sm:py-2.5 text-[0.68rem] font-semibold tracking-[.12em] uppercase hover:bg-white/10 transition-colors min-h-[44px] w-full sm:w-auto"
            >
              Ver imóveis
            </Link>
          </div>
        </div>

        {/* Retrato do corretor */}
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

/* ─────────────────────────────────── BUSCA ─────────────────────────────────── */
function SearchBar() {
  return (
    <div className="-mt-6 sm:-mt-7 relative z-20 px-3 sm:px-4">
      <div className="max-w-[1100px] mx-auto bg-white rounded-xl shadow-[0_10px_32px_rgba(11,20,32,.1)] border border-[#e8e6e1] px-3 py-3 sm:px-4">
        <form className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.3fr_auto] gap-2 sm:gap-3 items-end" action="#">
          <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-[#eeebe6] pb-2 sm:pb-0 sm:pr-3">
            <label className="text-[0.55rem] font-semibold tracking-[.12em] uppercase text-[#9a9da2]">Tipo</label>
            <select className="border-0 bg-transparent font-sans text-[0.84rem] text-[#2a3541] outline-none py-1 cursor-pointer w-full">
              <option>Todos os imóveis</option>
              <option>Apartamentos</option>
              <option>Casas</option>
              <option>Coberturas</option>
              <option>Terrenos</option>
            </select>
          </div>
          <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-[#eeebe6] pb-2 sm:pb-0 sm:pr-3">
            <label className="text-[0.55rem] font-semibold tracking-[.12em] uppercase text-[#9a9da2]">Valor</label>
            <select className="border-0 bg-transparent font-sans text-[0.84rem] text-[#2a3541] outline-none py-1 cursor-pointer w-full">
              <option>Todos os valores</option>
              <option>Até R$ 1M</option>
              <option>R$ 1M a R$ 3M</option>
              <option>R$ 3M a R$ 8M</option>
              <option>Acima de R$ 8M</option>
            </select>
          </div>
          <div className="flex flex-col gap-0.5 border-b sm:border-b-0 border-[#eeebe6] pb-2 sm:pb-0">
            <label className="text-[0.55rem] font-semibold tracking-[.12em] uppercase text-[#9a9da2]">Cidade</label>
            <input
              type="text"
              placeholder="BC, Itapema, Porto Belo…"
              className="border-0 bg-transparent font-sans text-[0.84rem] text-[#2a3541] outline-none py-1 placeholder:text-[#b0b5bb] w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-[#0e6b7a] text-white rounded-lg px-6 py-2.5 text-[0.68rem] font-semibold tracking-[.12em] uppercase hover:bg-[#095260] transition-colors w-full sm:w-auto min-h-[42px]"
          >
            Buscar
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────── IMÓVEIS (FOCO) ─────────────────────────────── */
function PropertiesSection() {
  const [tab, setTab] = useState<'venda' | 'aluguel'>('venda')
  const list = tab === 'venda' ? featuredProperties : rentalProperties
  const hrefBase = tab === 'venda' ? '/vendas' : '/aluguel'

  return (
    <section className="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5 sm:mb-7">
          <div>
            <h2
              className="text-[1.3rem] sm:text-[1.55rem] font-normal text-[#0b1420]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Imóveis no litoral
            </h2>
            <p className="mt-1 text-[0.82rem] text-[#6f7680]">
              Seleção curada por Marcos Teodoro em BC, Itapema, Porto Belo e Bombinhas
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full bg-[#f4f2ee] self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setTab('venda')}
              className={`flex-1 sm:flex-none rounded-full px-4 py-2 text-[0.68rem] font-semibold tracking-[.08em] uppercase transition-colors min-h-[40px] ${
                tab === 'venda' ? 'bg-[#0e6b7a] text-white' : 'text-[#5a6069] hover:text-[#0b1420]'
              }`}
            >
              À venda
            </button>
            <button
              type="button"
              onClick={() => setTab('aluguel')}
              className={`flex-1 sm:flex-none rounded-full px-4 py-2 text-[0.68rem] font-semibold tracking-[.08em] uppercase transition-colors min-h-[40px] ${
                tab === 'aluguel' ? 'bg-[#0e6b7a] text-white' : 'text-[#5a6069] hover:text-[#0b1420]'
              }`}
            >
              Aluguel
            </button>
          </div>
        </div>

        {/* Atalhos rápidos */}
        <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {[
            { label: 'Frente ao mar', href: '/vendas' },
            { label: 'Condomínios', href: '/vendas' },
            { label: 'Lançamentos', href: '/vendas' },
            { label: 'Locação anual', href: '/aluguel' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="shrink-0 text-[0.72rem] text-[#5a6069] border border-[#e8e6e1] rounded-full px-3.5 py-1.5 hover:border-[#0e6b7a] hover:text-[#0e6b7a] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {list.map((p) => (
            <PropertyCard key={p.id} property={p} href={`${hrefBase}/${p.id}`} />
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <Link
            href={hrefBase}
            className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[.12em] uppercase text-[#0e6b7a] hover:text-[#095260] transition-colors border-b border-[#0e6b7a]/30 pb-0.5"
          >
            Ver todos os imóveis
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── FAIXA DO CORRETOR ─────────────────────────────── */
function BrokerStrip() {
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
              Consultoria personalizada para comprar, vender ou alugar no litoral. Sem custo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
            <a
              href="https://wa.me/5547991594019?text=Olá%2C%20gostaria%20de%20uma%20consultoria."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#0e6b7a] text-white rounded-full px-6 py-2.5 text-[0.68rem] font-semibold tracking-[.12em] uppercase hover:bg-[#095260] transition-colors min-h-[42px] whitespace-nowrap"
            >
              WhatsApp
            </a>
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
    </section>
  )
}
