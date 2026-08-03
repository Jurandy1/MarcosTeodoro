'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PropertyCard } from './property-card'
import {
  CITY_FILTERS,
  filterProperties,
  type CatalogProperty,
  type PropertyKind,
  type PropertyMode,
} from '@/lib/properties'
import { propertyPublicPath } from '@/lib/property-title'

interface ListingLayoutProps {
  title: string
  titleEm: string
  subtitle: string
  properties: CatalogProperty[]
  mode: PropertyMode
}

const PRICE_PRESETS_VENDA = [
  { label: 'Até 2 mi', value: 2000000 },
  { label: 'Até 4 mi', value: 4000000 },
  { label: 'Até 7 mi', value: 7000000 },
  { label: 'Até 15 mi', value: 15000000 },
]

const PRICE_PRESETS_ALUGUEL = [
  { label: 'Até 3 mil', value: 3000 },
  { label: 'Até 6 mil', value: 6000 },
  { label: 'Até 10 mil', value: 10000 },
  { label: 'Até 20 mil', value: 20000 },
]

export function ListingLayout({ title, titleEm, subtitle, properties, mode }: ListingLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') ?? '')

  const kind = (searchParams.get('tipo') as PropertyKind | null) || null
  const city = searchParams.get('cidade')
  const bedroomsMin = searchParams.get('dormitorios')
    ? Number(searchParams.get('dormitorios'))
    : null
  const bathroomsMin = searchParams.get('banheiros')
    ? Number(searchParams.get('banheiros'))
    : null
  const priceMax = searchParams.get('preco') ? Number(searchParams.get('preco')) : null
  const q = searchParams.get('q')
  const sortBy = (searchParams.get('ordem') as 'recente' | 'menor' | 'maior') || 'recente'

  useEffect(() => {
    setSearchDraft(q ?? '')
  }, [q])

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      Object.entries(patch).forEach(([key, value]) => {
        if (!value) next.delete(key)
        else next.set(key, value)
      })
      const qs = next.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchDraft.trim()
      if ((q ?? '') === next) return
      updateParams({ q: next || null })
    }, 280)
    return () => clearTimeout(t)
  }, [searchDraft, q, updateParams])

  const filtered = useMemo(
    () =>
      filterProperties(properties, {
        kind,
        city,
        bedroomsMin,
        bathroomsMin,
        priceMax,
        q,
        sortBy,
      }),
    [properties, kind, city, bedroomsMin, bathroomsMin, priceMax, q, sortBy],
  )

  const clearAll = () => {
    setSearchDraft('')
    updateParams({
      tipo: null,
      cidade: null,
      dormitorios: null,
      banheiros: null,
      preco: null,
      q: null,
      ordem: null,
    })
  }

  const activeCount = [kind, city, bedroomsMin, bathroomsMin, priceMax, q].filter(Boolean).length
  const basePath = mode === 'venda' ? '/vendas' : '/aluguel'

  return (
    <div>
      <div className="bg-[#faf9f7] border-b border-[#e8e6e1]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
            <h1 className="font-serif text-[1.55rem] sm:text-[1.85rem] font-normal text-[#0b1420] leading-tight">
              {title} <em className="not-italic text-[#0e6b7a]">{titleEm}</em>
            </h1>
            <p className="text-[#6f7680] text-[0.78rem]">
              {filtered.length} {filtered.length === 1 ? 'imóvel' : 'imóveis'} · {subtitle}
            </p>
          </div>

          {/* Busca rápida */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9da2]" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Buscar por nome, empreendimento ou cidade…"
              className="w-full font-sans text-[0.9rem] pl-11 pr-4 py-3.5 border border-[#e6e2da] rounded-xl bg-white text-[#0b1420] outline-none focus:border-[#0e6b7a] shadow-[0_2px_10px_rgba(11,20,32,.04)]"
            />
          </div>

          {/* Filtros rápidos */}
          <div className="space-y-3">
            <QuickRow label="Tipo">
              {(
                [
                  { id: null, label: 'Todos' },
                  { id: 'apartamento' as const, label: 'Apartamentos' },
                  { id: 'casa' as const, label: 'Casas' },
                ] as const
              ).map((opt) => (
                <QuickChip
                  key={String(opt.id)}
                  active={kind === opt.id || (!kind && opt.id === null)}
                  onClick={() => updateParams({ tipo: opt.id })}
                >
                  {opt.label}
                </QuickChip>
              ))}
            </QuickRow>

            <QuickRow label="Cidade">
              <QuickChip active={!city} onClick={() => updateParams({ cidade: null })}>
                Todas
              </QuickChip>
              {CITY_FILTERS.map((c) => (
                <QuickChip
                  key={c}
                  active={city === c}
                  onClick={() => updateParams({ cidade: city === c ? null : c })}
                >
                  {c === 'Balneário Camboriú' ? 'BC' : c}
                </QuickChip>
              ))}
            </QuickRow>

            <QuickRow label="Dorm.">
              {[1, 2, 3, 4, 5].map((n) => (
                <QuickChip
                  key={n}
                  active={bedroomsMin === n}
                  onClick={() =>
                    updateParams({ dormitorios: bedroomsMin === n ? null : String(n) })
                  }
                >
                  {n}+
                </QuickChip>
              ))}
            </QuickRow>

            {(mode === 'venda' || mode === 'aluguel') && (
              <QuickRow label="Valor">
                {(mode === 'venda' ? PRICE_PRESETS_VENDA : PRICE_PRESETS_ALUGUEL).map((p) => (
                  <QuickChip
                    key={p.value}
                    active={priceMax === p.value}
                    onClick={() =>
                      updateParams({ preco: priceMax === p.value ? null : String(p.value) })
                    }
                  >
                    {p.label}
                  </QuickChip>
                ))}
              </QuickRow>
            )}
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-[0.72rem] font-semibold tracking-[.08em] uppercase text-[#0e6b7a] hover:text-[#095260]"
            >
              Limpar filtros ({activeCount})
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1fr_240px] gap-5 md:gap-7 py-5 md:py-7 pb-24 md:pb-7">
        <main className="min-w-0">
          <button
            type="button"
            className="md:hidden w-full mb-4 flex items-center justify-between gap-3 bg-white border border-[#e6e2da] rounded-xl px-4 py-3 text-[0.72rem] font-bold tracking-[.12em] uppercase text-[#0b1420]"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            <span className="flex items-center gap-2">
              <FilterIcon />
              Mais filtros
            </span>
            <span className="text-[#0e6b7a]">{filtersOpen ? 'Fechar' : 'Abrir'}</span>
          </button>

          <div className={`md:hidden mb-4 ${filtersOpen ? 'block' : 'hidden'}`}>
            <FilterPanel
              mode={mode}
              bathroomsMin={bathroomsMin}
              onChange={updateParams}
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <p className="text-[0.78rem] text-[#6f7680]">
              {filtered.length === 0
                ? 'Nenhum resultado'
                : `Mostrando ${filtered.length} ${filtered.length === 1 ? 'imóvel' : 'imóveis'}`}
            </p>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <select
                value={sortBy}
                onChange={(e) =>
                  updateParams({ ordem: e.target.value === 'recente' ? null : e.target.value })
                }
                className="font-sans text-[0.72rem] px-2.5 py-1.5 border border-[#e6e2da] rounded-lg text-[#444] bg-white outline-none focus:border-[#0e6b7a] cursor-pointer"
              >
                <option value="recente">Mais recentes</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
              </select>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Visualizar em grade"
                  aria-pressed={viewMode === 'grid'}
                  className={`border rounded-lg p-1.5 text-[#6b6e73] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#0e6b7a] text-white border-[#0e6b7a]' : 'bg-white border-[#e6e2da]'}`}
                >
                  <GridIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="Visualizar em lista"
                  aria-pressed={viewMode === 'list'}
                  className={`border rounded-lg p-1.5 text-[#6b6e73] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#0e6b7a] text-white border-[#0e6b7a]' : 'bg-white border-[#e6e2da]'}`}
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-8 text-center text-[#6f7680] text-[0.9rem]">
              Nenhum imóvel encontrado. Tente limpar ou ajustar os filtros.
              <button
                type="button"
                className="block mx-auto mt-3 text-[#0e6b7a] font-semibold text-[0.75rem] tracking-[.08em] uppercase"
                onClick={clearAll}
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {filtered.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  href={propertyPublicPath(p.id, mode)}
                />
              ))}
            </div>
          )}
        </main>

        <aside className="hidden md:block">
          <FilterPanel mode={mode} bathroomsMin={bathroomsMin} onChange={updateParams} />
        </aside>
      </div>
    </div>
  )
}

function QuickRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-12 pt-1.5 text-[0.62rem] font-semibold tracking-[.12em] uppercase text-[#8a9098]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5 min-w-0">{children}</div>
    </div>
  )
}

function QuickChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[0.72rem] font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-[#0e6b7a] text-white'
          : 'bg-white border border-[#e6e2da] text-[#2a3541] hover:border-[#0e6b7a] hover:text-[#0e6b7a]'
      }`}
    >
      {children}
    </button>
  )
}

function FilterPanel({
  mode,
  bathroomsMin,
  onChange,
}: {
  mode: PropertyMode
  bathroomsMin: number | null
  onChange: (patch: Record<string, string | null>) => void
}) {
  return (
    <div className="space-y-4 text-[0.78rem] sticky top-24">
      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
        <h3 className="text-[0.6rem] font-semibold tracking-[.14em] uppercase text-[#6f7680] mb-3">
          Finalidade
        </h3>
        <Link
          href="/vendas"
          className={`flex items-center gap-2.5 py-1.5 ${mode === 'venda' ? 'text-[#0e6b7a] font-semibold' : 'text-[#2a3541]'}`}
        >
          Venda
        </Link>
        <Link
          href="/aluguel"
          className={`flex items-center gap-2.5 py-1.5 ${mode === 'aluguel' ? 'text-[#0e6b7a] font-semibold' : 'text-[#2a3541]'}`}
        >
          Aluguel
        </Link>
      </div>

      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
        <h3 className="text-[0.6rem] font-semibold tracking-[.14em] uppercase text-[#6f7680] mb-3">
          Banheiros
        </h3>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ banheiros: bathroomsMin === n ? null : String(n) })}
              className={`border rounded-md px-3 py-1.5 text-[0.72rem] cursor-pointer transition-colors ${
                bathroomsMin === n
                  ? 'border-[#0e6b7a] bg-[#e8f4f6] text-[#0e6b7a]'
                  : 'border-[#e8e6e1] bg-white text-[#2a3541] hover:border-[#0e6b7a]'
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[#e8e6e1] rounded-xl p-5 text-center bg-[#faf9f7]">
        <p className="text-[0.8rem] text-[#5a6069] mb-3 leading-relaxed">
          Não achou o que procura?
        </p>
        <a
          href="https://wa.me/5547991594019?text=Olá%2C%20preciso%20de%20ajuda%20para%20encontrar%20um%20imóvel."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#0e6b7a] text-[0.68rem] font-semibold tracking-[.1em] uppercase hover:underline underline-offset-4"
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
