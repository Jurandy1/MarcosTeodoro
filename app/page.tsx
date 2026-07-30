import Image from 'next/image'
import Link from 'next/link'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PropertyCard, type Property } from '@/components/property-card'

const featuredProperties: Property[] = [
  {
    id: '1024',
    badge: 'Vista para o mar',
    badgeVariant: 'dark',
    gradientClass: 'g1',
    location: 'Balneário Camboriú · Central',
    city: 'Balneário Camboriú · Central',
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
    badgeVariant: 'ocean',
    gradientClass: 'g2',
    location: 'Itajaí · Praia Brava',
    city: 'Itajaí · Praia Brava',
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
    badgeVariant: 'gold',
    gradientClass: 'g1',
    location: 'Itapema · Meia Praia',
    city: 'Itapema · Meia Praia',
    title: 'Edifício Aquamarine Residence',
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    area: 172,
    price: 'R$ 4.500.000',
  },
  {
    id: '1002',
    badge: 'Condomínio fechado',
    badgeVariant: 'dark',
    gradientClass: 'g4',
    location: 'Porto Belo · Perequê',
    city: 'Porto Belo · Perequê',
    title: 'Sobrado no Costa Verde Perequê',
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    area: 310,
    price: 'R$ 3.200.000',
  },
]

const rentalProperties: Property[] = [
  {
    id: '2001',
    badge: 'Frente-mar',
    badgeVariant: 'ocean',
    gradientClass: 'g1',
    location: 'Balneário Camboriú · Barra Sul',
    city: 'Balneário Camboriú · Barra Sul',
    title: 'Cobertura frente-mar duplex',
    bedrooms: 4,
    bathrooms: 5,
    parking: 4,
    area: '—',
    price: 'Consulte-nos',
  },
  {
    id: '2002',
    badge: 'Alto padrão',
    badgeVariant: 'dark',
    gradientClass: 'g2',
    location: 'Itapema · Meia Praia',
    city: 'Itapema · Meia Praia',
    title: 'Apartamento alto padrão',
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    area: '—',
    price: 'Consulte-nos',
  },
  {
    id: '2003',
    badge: 'Vista mar',
    badgeVariant: 'ocean',
    gradientClass: 'g3',
    location: 'Itapema · Meia Praia',
    city: 'Itapema · Meia Praia',
    title: 'Apartamento vista mar',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: '—',
    price: 'Consulte-nos',
  },
  {
    id: '2004',
    badge: 'Exclusivo',
    badgeVariant: 'gold',
    gradientClass: 'g4',
    location: 'Balneário Camboriú',
    city: 'Balneário Camboriú',
    title: 'Casa em condomínio fechado',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: '—',
    price: 'Consulte-nos',
  },
]

const intentCards = [
  {
    icon: 'M',
    title: 'Quero morar',
    desc: 'Encontre o imóvel ideal para viver no litoral — apartamentos, casas e coberturas em BC, Itapema e Porto Belo.',
    cta: 'Ver imóveis à venda',
    href: '/vendas',
  },
  {
    icon: 'I',
    title: 'Quero investir',
    desc: 'Visão estratégica para alavancar patrimônio e transformar oportunidades em grandes negócios no litoral de SC.',
    cta: 'Falar com Marcos',
    href: 'https://wa.me/5547991594019?text=Olá%20Marcos%2C%20quero%20investir%20em%20imóveis%20no%20litoral.',
  },
  {
    icon: 'A',
    title: 'Quero alugar',
    desc: 'Locação anual de alto padrão no litoral Norte — viva bem onde outros sonham em passar as férias.',
    cta: 'Ver imóveis para alugar',
    href: '/aluguel',
  },
]

const popularSearches = [
  { label: 'Apartamentos frente-mar em BC' },
  { label: 'Coberturas em Balneário Camboriú' },
  { label: 'Casas em condomínio em Itapema' },
  { label: 'Lançamentos pré-obra litoral SC' },
  { label: 'Imóveis para locação anual em Itapema' },
  { label: 'Imóveis em Porto Belo e Bombinhas' },
]

export default function HomePage() {
  return (
    <>
      <Topbar />
      <SiteHeader />
      <main>
        <HeroSection />
        <SearchBar />
        <CategoriesSection />
        <FeaturedSection />
        <AboutSection />
        <RentalSection />
        <IntentSection />
        <PopularSearches />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}

/* ─────────────────────────────────── HERO ─────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative text-white overflow-hidden" style={{ background: '#0b1420' }}>
      {/* Foto de fundo */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Balneario-Camboriu-YDWA5F7IOLzHQrpzMPiKIvILofymQH.jpg"
          alt=""
          fill
          className="object-cover object-[center_60%]"
          priority
          quality={90}
        />
        {/* Overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg,rgba(11,20,32,.55) 0%,rgba(11,20,32,.4) 40%,rgba(11,20,32,.9) 100%), linear-gradient(90deg,rgba(11,20,32,.75) 0%,rgba(11,20,32,.35) 100%)',
          }}
        />
        {/* Texto decorativo animado */}
        <div
          className="absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden pointer-events-none select-none"
          style={{ opacity: 0.06 }}
          aria-hidden="true"
        >
          {['LITORAL', 'INVESTIMENTO', 'LITORAL', 'EXCLUSIVO'].map((text, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-transparent"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(2.8rem, 14vw, 5.6rem)',
                WebkitTextStroke: '1px #c9a35a',
                animation: `marquee ${18 + i * 5}s linear infinite ${i % 2 ? 'reverse' : ''}`,
              }}
            >
              {`${text} · ${text} · ${text} · ${text} · ${text} · ${text} · `}
            </span>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 grid md:grid-cols-[1.15fr_.85fr] items-center gap-8 md:gap-10 py-12 sm:py-16 md:py-24 pb-16 sm:pb-20">
        {/* Texto */}
        <div className="order-2 md:order-1">
          <div
            className="anim-1 inline-block text-[#c9a35a] text-[0.58rem] sm:text-[0.68rem] font-semibold tracking-[.16em] sm:tracking-[.24em] uppercase mb-4 sm:mb-5"
          >
            BC · Itapema · Porto Belo · Bombinhas
          </div>
          <h1
            className="anim-2 text-[2.1rem] sm:text-4xl md:text-[2.6rem] font-medium leading-[1.15] tracking-tight mb-4 sm:mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Você sabe quem<br />
            <em className="not-italic text-[#c9a35a]">sou eu?</em>
          </h1>
          <p className="anim-3 text-[#c3c6cc] text-[0.88rem] sm:text-[0.95rem] leading-relaxed max-w-[50ch] mb-6 sm:mb-8">
            Administrador, investidor e especialista em investimento imobiliário no litoral de
            Santa Catarina. Com uma visão estratégica, ajudo a alavancar patrimônio e transformo
            oportunidades em grandes negócios.{' '}
            <em className="text-white/80 not-italic">Morar bem é um privilégio.</em>
          </p>
          {/* Stats */}
          <div className="anim-4 flex gap-6 sm:gap-8 flex-wrap">
            {[
              { num: '4', unit: 'cidades', label: 'BC · Itapema · Porto Belo · Bombinhas' },
              { num: 'CRECI', unit: '', label: 'SC 71914' },
            ].map((s, i) => (
              <div key={i} className="min-w-0">
                <div
                  className="text-[1.45rem] sm:text-[1.7rem] text-[#c9a35a] leading-none"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {s.num}
                  {s.unit && (
                    <span className="text-[0.9rem] sm:text-[1rem] text-[#c9a35a]/80 ml-1">{s.unit}</span>
                  )}
                </div>
                <div className="text-[0.52rem] sm:text-[0.58rem] tracking-[.14em] sm:tracking-[.24em] text-[#8b8f96] uppercase mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retrato */}
        <div className="flex justify-center order-1 md:order-2">
          <div className="relative w-[min(260px,72vw)] sm:w-[min(320px,80vw)]" style={{ aspectRatio: '4/5' }}>
            {/* Borda decorativa deslocada */}
            <div
              className="absolute inset-0 rounded-lg border border-[#c9a35a]/50"
              style={{ transform: 'translate(10px, 10px)' }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 rounded-lg overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,.45)]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amrcos-AyeiWeXupJzq8ST9I0UpYvAXaaRlPf.jpg"
                alt="Marcos Teodoro, Corretor de Imóveis"
                fill
                className="object-cover object-[center_18%]"
                priority
                quality={90}
                sizes="(max-width: 768px) 72vw, 320px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Linha decorativa inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(201,163,90,.4),transparent)' }}
        aria-hidden="true"
      />
    </section>
  )
}

/* ─────────────────────────────────── BUSCA ─────────────────────────────────── */
function SearchBar() {
  return (
    <div className="-mt-8 sm:-mt-12 relative z-20 px-3 sm:px-4">
      <div
        className="max-w-[980px] mx-auto bg-white rounded-2xl shadow-[0_18px_48px_rgba(11,20,32,.14)] border-t-[3px] border-[#c9a35a] p-3 sm:p-4"
      >
        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.4fr_auto] gap-2.5 sm:gap-3"
          action="#"
        >
          <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-[#e6e2da] pb-2.5 sm:pb-0 sm:pr-3">
            <label className="text-[0.58rem] font-bold tracking-[.18em] uppercase text-[#9a9da2]">
              Tipo de imóvel
            </label>
            <select className="border-0 bg-transparent font-sans text-[0.86rem] text-[#2a3541] outline-none py-1 cursor-pointer w-full">
              <option>Todos os imóveis</option>
              <option>Apartamentos frente-mar</option>
              <option>Casas de praia</option>
              <option>Coberturas duplex</option>
              <option>Terrenos</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-[#e6e2da] pb-2.5 sm:pb-0 sm:pr-3">
            <label className="text-[0.58rem] font-bold tracking-[.18em] uppercase text-[#9a9da2]">
              Faixa de valor
            </label>
            <select className="border-0 bg-transparent font-sans text-[0.86rem] text-[#2a3541] outline-none py-1 cursor-pointer w-full">
              <option>Todos os valores</option>
              <option>Até R$ 1.000.000</option>
              <option>R$ 1M a R$ 3M</option>
              <option>R$ 3M a R$ 8M</option>
              <option>Acima de R$ 8M</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 border-b sm:border-b-0 border-[#e6e2da] pb-2.5 sm:pb-0">
            <label className="text-[0.58rem] font-bold tracking-[.18em] uppercase text-[#9a9da2]">
              Localização
            </label>
            <input
              type="text"
              placeholder="Balneário Camboriú, Itapema…"
              className="border-0 bg-transparent font-sans text-[0.86rem] text-[#2a3541] outline-none py-1 placeholder:text-[#b0b5bb] w-full"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#0e6b7a] text-white rounded-xl px-6 py-3 sm:py-2.5 text-[0.7rem] font-bold tracking-[.16em] uppercase transition-all hover:bg-[#095260] w-full sm:w-auto min-h-[44px]"
          >
            <SearchIcon />
            Buscar
          </button>
        </form>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

/* ─────────────────────────────────── CATEGORIAS ─────────────────────────────── */
function CategoriesSection() {
  const cats = [
    { num: '01', title: 'Frente-mar', sub: 'Apartamentos e coberturas', href: '/vendas' },
    { num: '02', title: 'Condomínios', sub: 'Casas de alto padrão', href: '/vendas' },
    { num: '03', title: 'Lançamentos', sub: 'Pré-obra e novidades', href: '/vendas' },
    { num: '04', title: 'Para Alugar', sub: 'Locação anual no litoral', href: '/aluguel' },
    { num: '01', title: 'Frente-mar', sub: 'Apartamentos e coberturas', href: '/vendas' },
    { num: '02', title: 'Condomínios', sub: 'Casas de alto padrão', href: '/vendas' },
    { num: '03', title: 'Lançamentos', sub: 'Pré-obra e novidades', href: '/vendas' },
    { num: '04', title: 'Para Alugar', sub: 'Locação anual no litoral', href: '/aluguel' },
  ]

  return (
    <section className="pt-10 sm:pt-16 pb-4 overflow-hidden" style={{ background: 'linear-gradient(180deg,#fff 0%,#fbf9f4 100%)' }}>
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h2
          className="font-light text-[1.55rem] sm:text-[1.9rem] leading-tight max-w-[20ch] text-[#0b1420]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          O que você está<br />
          <em className="text-[#0e6b7a]">procurando?</em>
        </h2>
        <p className="max-w-[36ch] text-[#5a6069] text-[0.84rem] sm:text-[0.88rem] leading-relaxed">
          Portfólio exclusivo de imóveis no litoral Norte de SC — curado por Marcos Teodoro.
        </p>
      </div>

      {/* Carrossel animado */}
      <div className="overflow-hidden">
        <div className="flex gap-3 sm:gap-4" style={{ animation: 'marquee 42s linear infinite', width: 'max-content', padding: '0.5rem 0' }}>
          {cats.map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="flex-none w-[260px] sm:w-[340px] h-[170px] sm:h-[200px] relative rounded-2xl overflow-hidden text-white flex flex-col justify-between p-4 sm:p-5 shadow-[0_10px_30px_rgba(11,20,32,.15)] hover:-translate-y-1 transition-transform"
              style={{
                background: `linear-gradient(160deg,#0e6b7a 0%,#08414a 60%,#0b1420 100%)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 2px,transparent 2px 14px)' }}
                aria-hidden="true"
              />
              <div
                className="absolute right-[-30px] bottom-[-30px] w-[180px] h-[180px] rounded-full"
                style={{ background: 'radial-gradient(circle,rgba(201,163,90,.35),transparent 65%)' }}
                aria-hidden="true"
              />
              <div className="relative text-[0.62rem] tracking-[.3em] text-[#c9a35a] uppercase">{cat.num}</div>
              <div className="relative">
                <div
                  className="text-[1.55rem] sm:text-[1.9rem] leading-none mb-1"
                  style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
                >
                  {cat.title}
                </div>
                <div className="text-[0.55rem] sm:text-[0.6rem] tracking-[.18em] sm:tracking-[.24em] uppercase text-white/60">{cat.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────── IMÓVEIS EM DESTAQUE ─────────────────────────────── */
function FeaturedSection() {
  return (
    <section className="py-8 sm:py-12 bg-[#fbf9f4]">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-7">
          <h2
            className="flex items-center gap-2 sm:gap-3 text-[1.15rem] sm:text-[1.35rem] font-normal text-[#0b1420] min-w-0"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <span className="w-5 sm:w-7 h-0.5 bg-[#c9a35a] rounded-full inline-block shrink-0" aria-hidden="true" />
            <span className="truncate">Imóveis em Destaque</span>
          </h2>
          <Link
            href="/vendas"
            className="text-[0.62rem] sm:text-[0.68rem] font-bold tracking-[.1em] sm:tracking-[.14em] uppercase text-[#0e6b7a] hover:text-[#095260] transition-colors flex items-center gap-1 shrink-0"
          >
            Ver todos &rarr;
          </Link>
        </div>

        {/* Scroll horizontal em mobile, 4 colunas em desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} href={`/vendas/${p.id}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────── SOBRE ─────────────────────────────────── */
function AboutSection() {
  return (
    <section id="sobre" className="py-10 sm:py-16 relative overflow-hidden bg-[#f4f2ee]">
      {/* Círculo decorativo de fundo */}
      <div
        className="absolute top-0 right-0 w-[40%] h-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 30%,rgba(14,107,122,.06),transparent 60%)' }}
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto px-4 grid md:grid-cols-[360px_1fr] items-center gap-8 md:gap-14 relative">
        {/* Foto */}
        <div className="relative mx-auto md:mx-0 w-full max-w-[280px] sm:max-w-[360px] aspect-[4/5] rounded-lg overflow-hidden shadow-[0_30px_80px_rgba(11,20,32,.15)]">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marcos-JBAkoIxvj0GDhvLLo503L00XTpnJTP.jpg"
            alt="Marcos Teodoro — Corretor de Imóveis"
            fill
            className="object-cover object-[center_18%]"
            quality={90}
            sizes="(max-width: 768px) 280px, 360px"
          />
          {/* Borda decorativa */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(201,163,90,.2)' }}
            aria-hidden="true"
          />
        </div>

        {/* Texto */}
        <div>
          <div className="text-[0.6rem] sm:text-[0.64rem] font-semibold tracking-[.16em] sm:tracking-[.22em] uppercase text-[#0e6b7a] mb-3">
            Você sabe quem sou eu?
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.65rem] md:text-[2rem] font-semibold leading-tight text-[#0b1420] mb-4 sm:mb-5 max-w-[26ch]">
            Sou Marcos Teodoro — administrador, investidor e especialista no litoral de SC
          </h2>
          <p className="text-[#4a5560] text-[0.86rem] sm:text-[0.9rem] leading-relaxed mb-4 max-w-[58ch]">
            Com uma visão estratégica, ajudo a alavancar patrimônio, transformo oportunidades em grandes negócios e transformo seu sonho no mercado imobiliário em realidade — mais precisamente em Porto Belo, Itapema e Balneário Camboriú.
          </p>
          <p className="text-[#4a5560] text-[0.86rem] sm:text-[0.9rem] leading-relaxed mb-6 sm:mb-7 max-w-[58ch]">
            E você, quem é? Como posso te ajudar? O que você deseja com o mercado imobiliário — <strong className="text-[#0b1420] font-semibold">morar ou investir?</strong>
          </p>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-[480px] mb-6 sm:mb-7">
            {[
              { num: 'BC', label: 'Balneário Camboriú', desc: 'Litoral Norte de SC' },
              { num: 'ITP', label: 'Itapema', desc: 'Litoral Norte de SC' },
              { num: 'PB', label: 'Porto Belo', desc: 'Litoral Norte de SC' },
              { num: 'CRECI', label: 'SC 71914', desc: 'Corretor credenciado' },
            ].map((m, i) => (
              <div key={i} className="border-t-2 border-[#0e6b7a]/20 pt-3">
                <div
                  className="text-[1.55rem] text-[#0e6b7a] leading-none mb-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {m.num}
                </div>
                <div className="text-[0.62rem] font-bold tracking-[.2em] uppercase text-[#4a5560]">{m.label}</div>
                <div className="text-[0.74rem] text-[#6f7680] mt-0.5">{m.desc}</div>
              </div>
            ))}
          </div>

          <Link
            href="/#contato"
            className="inline-block bg-[#0e6b7a] text-white rounded-full px-8 py-3 text-[0.72rem] font-bold tracking-[.14em] uppercase transition-all hover:bg-[#095260] hover:-translate-y-0.5"
          >
            Fale com Marcos
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────── ALUGUEL ─────────────────────────────────── */
function RentalSection() {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-7">
          <h2
            className="flex items-center gap-2 sm:gap-3 text-[1.15rem] sm:text-[1.35rem] font-normal text-[#0b1420]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <span className="w-5 sm:w-7 h-0.5 bg-[#c9a35a] rounded-full inline-block shrink-0" aria-hidden="true" />
            Para <em className="italic">Alugar</em>
          </h2>
          <Link
            href="/aluguel"
            className="text-[0.62rem] sm:text-[0.68rem] font-bold tracking-[.1em] sm:tracking-[.14em] uppercase text-[#0e6b7a] hover:text-[#095260] transition-colors flex items-center gap-1 shrink-0"
          >
            Ver todos &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rentalProperties.map((p) => (
            <PropertyCard key={p.id} property={p} href={`/aluguel/${p.id}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── MORAR OU INVESTIR? ─────────────────────────────── */
function IntentSection() {
  return (
    <section className="py-10 sm:py-14 bg-[#f4f2ee]">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="mb-6 sm:mb-8 text-center max-w-[52ch] mx-auto">
          <h2
            className="text-[1.4rem] sm:text-[1.65rem] font-normal leading-tight text-[#0b1420] mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            E você, como posso <em className="text-[#0e6b7a]">te ajudar?</em>
          </h2>
          <p className="text-[0.84rem] sm:text-[0.88rem] text-[#5a6069]">
            Morar bem é um privilégio. Me conta o que você deseja com o mercado imobiliário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {intentCards.map((card, i) => (
            <a
              key={i}
              href={card.href}
              className="bg-white border border-[#e6e2da] rounded-2xl p-5 sm:p-7 hover:shadow-[0_14px_40px_rgba(11,20,32,.1)] hover:-translate-y-1 transition-all flex flex-col gap-4 sm:gap-5 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[1.2rem] shrink-0"
                style={{
                  background: 'linear-gradient(135deg,#0e6b7a,#095260)',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                }}
                aria-hidden="true"
              >
                {card.icon}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h3
                  className="text-[1.15rem] font-normal text-[#0b1420]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {card.title}
                </h3>
                <p className="text-[0.84rem] text-[#5a6069] leading-relaxed flex-1">{card.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[.14em] uppercase text-[#0e6b7a] group-hover:gap-3 transition-all">
                {card.cta}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────── BUSCAS POPULARES ─────────────────────────── */
function PopularSearches() {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2
          className="flex items-center gap-2 sm:gap-3 text-[1.15rem] sm:text-[1.35rem] font-normal text-[#0b1420] mb-5 sm:mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          <span className="w-5 sm:w-7 h-0.5 bg-[#c9a35a] rounded-full inline-block shrink-0" aria-hidden="true" />
          Buscas populares
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
          {popularSearches.map((s, i) => (
            <Link
              key={i}
              href="/vendas"
              className="flex justify-between items-center text-[0.74rem] sm:text-[0.78rem] text-[#4a5560] bg-[#f4f2ee] border border-transparent rounded-xl px-3.5 sm:px-4 py-3 sm:py-3 hover:border-[#0e6b7a] hover:text-[#0e6b7a] hover:bg-white transition-all group min-h-[44px]"
            >
              {s.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a35a] shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────── CTA ─────────────────────────────────── */
function CtaSection() {
  return (
    <section id="contato" className="py-6 sm:py-8 px-3 sm:px-4">
      <div
        className="max-w-[1200px] mx-auto rounded-2xl px-5 py-8 sm:p-12 text-center text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg,#0e6b7a,#095260)' }}
      >
        {/* Anéis decorativos */}
        <div className="absolute top-[-40px] right-[-40px] w-[280px] h-[280px] rounded-full border border-white/10 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-[20px] right-[20px] w-[200px] h-[200px] rounded-full border border-[#c9a35a]/30 pointer-events-none" aria-hidden="true" />

        <h2
          className="text-[1.55rem] sm:text-[2rem] md:text-[2.4rem] font-normal mb-3 relative leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Quer anunciar ou encontrar <em className="text-[#c9a35a]">seu imóvel?</em>
        </h2>
        <p className="text-[0.84rem] sm:text-[0.9rem] text-white/75 mb-6 sm:mb-8 max-w-[50ch] mx-auto relative">
          Fale direto com Marcos Teodoro e receba uma consultoria personalizada e sem custo.
        </p>
        <div className="flex gap-3 sm:gap-4 justify-center flex-col sm:flex-row relative">
          <a
            href="https://wa.me/5547991594019?text=Olá%2C%20gostaria%20de%20uma%20consultoria."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#c9a35a] text-[#0b1420] rounded-full px-6 sm:px-8 py-3.5 sm:py-3 text-[0.68rem] sm:text-[0.72rem] font-bold tracking-[.12em] sm:tracking-[.16em] uppercase transition-all hover:-translate-y-0.5 hover:shadow-xl min-h-[44px] inline-flex items-center justify-center"
          >
            Falar pelo WhatsApp
          </a>
          <a
            href="https://www.instagram.com/marcosteodoro.imoveis/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/15 text-white border border-white/30 rounded-full px-6 sm:px-8 py-3.5 sm:py-3 text-[0.68rem] sm:text-[0.72rem] font-bold tracking-[.12em] sm:tracking-[.16em] uppercase transition-all hover:bg-white/25 min-h-[44px] inline-flex items-center justify-center"
          >
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
