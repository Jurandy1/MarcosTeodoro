'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PropertyCard, type Property } from './property-card'

interface ListingLayoutProps {
  title: string
  titleEm: string
  subtitle: string
  properties: Property[]
  mode: 'venda' | 'aluguel'
}

export function ListingLayout({ title, titleEm, subtitle, properties, mode }: ListingLayoutProps) {
  const [sortBy, setSortBy] = useState('recente')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeChips, setActiveChips] = useState<string[]>([mode])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const removeChip = (chip: string) => setActiveChips((prev) => prev.filter((c) => c !== chip))

  return (
    <div>
      {/* Título da página */}
      <div className="bg-[#faf9f7] border-b border-[#e8e6e1]">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-6 sm:py-8">
          <h1
            className="text-[1.55rem] sm:text-[1.85rem] font-normal text-[#0b1420] leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {title} <em className="not-italic text-[#0e6b7a]">{titleEm}</em>
          </h1>
          <p className="text-[#6f7680] text-[0.78rem]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 grid md:grid-cols-[1fr_260px] gap-5 md:gap-7 py-5 md:py-7">
        {/* Listagem */}
        <main className="min-w-0">
          {/* Mobile filter toggle */}
          <button
            type="button"
            className="md:hidden w-full mb-4 flex items-center justify-between gap-3 bg-white border border-[#e6e2da] rounded-xl px-4 py-3 text-[0.72rem] font-bold tracking-[.12em] uppercase text-[#0b1420]"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            <span className="flex items-center gap-2">
              <FilterIcon />
              Filtros
            </span>
            <span className="text-[#0e6b7a]">{filtersOpen ? 'Fechar' : 'Abrir'}</span>
          </button>

          <div className={`md:hidden mb-4 ${filtersOpen ? 'block' : 'hidden'}`}>
            <FilterPanel mode={mode} />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            {/* Chips */}
            <div className="flex items-center gap-2 flex-wrap text-[0.72rem] sm:text-[0.76rem]">
              <span className="font-semibold text-[#2a3541]">Filtrando por:</span>
              {activeChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 bg-[#f4f2ee] border border-[#e6e2da] rounded-full px-3 py-1 text-[0.68rem] hover:border-[#0e6b7a] transition-colors"
                >
                  {chip}
                  <button
                    className="text-[#9a9da2] hover:text-[#0e6b7a] cursor-pointer font-medium leading-none"
                    onClick={() => removeChip(chip)}
                    aria-label={`Remover filtro ${chip}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none font-sans text-[0.72rem] px-2.5 py-1.5 border border-[#e6e2da] rounded-lg text-[#444] bg-white outline-none focus:border-[#0e6b7a] cursor-pointer"
              >
                <option value="recente">Data mais recente</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
              </select>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Visualizar em grade"
                  aria-pressed={viewMode === 'grid'}
                  className={`border rounded-lg p-1.5 text-[#6b6e73] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#0e6b7a] text-white border-[#0e6b7a]' : 'bg-white border-[#e6e2da] hover:border-[#0e6b7a]'}`}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="Visualizar em lista"
                  aria-pressed={viewMode === 'list'}
                  className={`border rounded-lg p-1.5 text-[#6b6e73] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#0e6b7a] text-white border-[#0e6b7a]' : 'bg-white border-[#e6e2da] hover:border-[#0e6b7a]'}`}
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} href={`/${mode === 'venda' ? 'vendas' : 'aluguel'}/${p.id}`} />
            ))}
          </div>

          {/* Paginação */}
          <nav className="flex justify-center gap-1.5 mt-8 flex-wrap" aria-label="Paginação">
            {['‹', '1', '2', '3', '4', '›'].map((p, i) => (
              <a
                key={i}
                href="#"
                className={`border rounded-lg px-3 py-1.5 text-[0.78rem] transition-all hover:border-[#0e6b7a] hover:text-[#0e6b7a] ${
                  p === '1'
                    ? 'bg-[#0e6b7a] text-white border-[#0e6b7a]'
                    : 'border-[#e6e2da] text-[#4a5560]'
                }`}
                aria-current={p === '1' ? 'page' : undefined}
              >
                {p}
              </a>
            ))}
          </nav>
        </main>

        {/* Sidebar desktop */}
        <aside className="hidden md:block">
          <FilterPanel mode={mode} />
        </aside>
      </div>
    </div>
  )
}

function FilterPanel({ mode }: { mode: 'venda' | 'aluguel' }) {
  return (
    <div className="space-y-4 text-[0.78rem]">
      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
        <h3 className="text-[0.6rem] font-semibold tracking-[.14em] uppercase text-[#6f7680] mb-3">Finalidade</h3>
        <label className="flex items-center gap-2.5 py-1.5 text-[#2a3541] cursor-pointer">
          <input type="radio" name="fin" defaultChecked={mode === 'venda'} className="accent-[#0e6b7a]" />
          Venda
        </label>
        <label className="flex items-center gap-2.5 py-1.5 text-[#2a3541] cursor-pointer">
          <input type="radio" name="fin" defaultChecked={mode === 'aluguel'} className="accent-[#0e6b7a]" />
          Aluguel
        </label>
      </div>

      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
        <h3 className="text-[0.6rem] font-semibold tracking-[.14em] uppercase text-[#6f7680] mb-3">Tipo</h3>
        {['Apartamento', 'Casa em Condomínio', 'Cobertura', 'Sobrado', 'Terreno'].map((label) => (
          <label key={label} className="flex items-center gap-2.5 py-1.5 text-[#2a3541] cursor-pointer">
            <input type="checkbox" className="accent-[#0e6b7a]" />
            {label}
          </label>
        ))}
      </div>

      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
        <h3 className="text-[0.6rem] font-semibold tracking-[.14em] uppercase text-[#6f7680] mb-3">Cidade</h3>
        {['Balneário Camboriú', 'Itapema', 'Porto Belo', 'Itajaí'].map((label) => (
          <label key={label} className="flex items-center gap-2.5 py-1.5 text-[#2a3541] cursor-pointer">
            <input type="checkbox" className="accent-[#0e6b7a]" />
            {label}
          </label>
        ))}
      </div>

      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
        <h3 className="text-[0.6rem] font-semibold tracking-[.14em] uppercase text-[#6f7680] mb-3">Quartos</h3>
        <div className="flex gap-2 flex-wrap">
          {['1+', '2+', '3+', '4+', '5+'].map((n) => (
            <button
              key={n}
              type="button"
              className="border border-[#e8e6e1] bg-white rounded-md px-3 py-1.5 text-[0.72rem] text-[#2a3541] cursor-pointer hover:border-[#0e6b7a] hover:text-[#0e6b7a] transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
        <h3 className="text-[0.6rem] font-semibold tracking-[.14em] uppercase text-[#6f7680] mb-3">Preço</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Mín."
            className="w-full font-sans text-[0.78rem] px-3 py-2 border border-[#e8e6e1] rounded-md text-[#444] outline-none focus:border-[#0e6b7a] bg-white"
          />
          <input
            type="text"
            placeholder="Máx."
            className="w-full font-sans text-[0.78rem] px-3 py-2 border border-[#e8e6e1] rounded-md text-[#444] outline-none focus:border-[#0e6b7a] bg-white"
          />
        </div>
      </div>

      <button
        type="button"
        className="w-full bg-[#0e6b7a] text-white border-0 rounded-lg py-3 text-[0.7rem] font-semibold tracking-[.12em] uppercase cursor-pointer hover:bg-[#095260] transition-colors"
      >
        Aplicar
      </button>

      <div className="border border-[#e8e6e1] rounded-xl p-5 text-center bg-[#faf9f7]">
        <p className="text-[0.8rem] text-[#5a6069] mb-3 leading-relaxed">Precisa de ajuda?</p>
        <a
          href="https://wa.me/5547991594019"
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
