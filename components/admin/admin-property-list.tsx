'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { AdminProperty } from '@/lib/admin-store'
import { CITY_FILTERS } from '@/lib/properties'
import { formatPropertyTitle, propertyPublicPath } from '@/lib/property-title'
import {
  propertyQualityIssues,
  QUALITY_LABELS,
} from '@/lib/property-quality'
import { storageUrl } from '@/lib/storage'
import {
  deleteAdminPropertyDb,
  fetchAdminProperties,
  saveAdminPropertyDb,
} from '@/lib/supabase/properties-api'
import { setPropertyFeatured } from '@/lib/supabase/settings-api'

const PAGE_SIZE = 10

type StatusFilter = 'todos' | 'pronto' | 'rascunho'
type KindFilter = 'todos' | 'apartamento' | 'casa'
type ModeFilter = 'todos' | 'venda' | 'aluguel'
type SortBy = 'recente' | 'titulo' | 'preco-asc' | 'preco-desc'

function StatusPill({ status }: { status: AdminProperty['status'] }) {
  const pronto = status === 'pronto'
  return (
    <span
      className={`text-[0.58rem] font-semibold tracking-[.12em] uppercase px-2 py-0.5 ${
        pronto ? 'bg-[#e7f5ef] text-[#1f6b4a]' : 'bg-[#f3efe6] text-[#8a7040]'
      }`}
    >
      {pronto ? 'Pronto' : 'Rascunho'}
    </span>
  )
}

function filterSelectClass(active: boolean) {
  return `min-h-[40px] border px-3 text-[0.82rem] outline-none focus:border-[#0e6b7a] ${
    active ? 'border-[#0e6b7a] bg-[#e8f4f6] text-[#0b1420]' : 'border-[#ddd7cc] bg-white text-[#2a3541]'
  }`
}

export function AdminPropertyList() {
  const [items, setItems] = useState<AdminProperty[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<StatusFilter>('todos')
  const [kind, setKind] = useState<KindFilter>('todos')
  const [mode, setMode] = useState<ModeFilter>('todos')
  const [city, setCity] = useState<string>('todos')
  const [sortBy, setSortBy] = useState<SortBy>('recente')
  const [page, setPage] = useState(1)

  const reload = async () => {
    try {
      setError(null)
      setItems(await fetchAdminProperties())
    } catch (e) {
      setItems([])
      setError(
        e instanceof Error
          ? e.message
          : 'Erro ao carregar. Confira se o schema SQL foi aplicado no Supabase.',
      )
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  // Qualquer filtro novo volta para a 1ª página
  useEffect(() => {
    setPage(1)
  }, [q, status, kind, mode, city, sortBy])

  const onDelete = async (id: string) => {
    if (!confirm('Excluir este imóvel?')) return
    try {
      await deleteAdminPropertyDb(id)
      await reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  const updateListingStatus = async (p: AdminProperty, nextStatus: 'pronto' | 'rascunho') => {
    try {
      if (nextStatus === 'pronto') {
        const issues = propertyQualityIssues(p)
        if (issues.includes('sem_foto') || issues.includes('sem_cidade') || issues.includes('sem_specs')) {
          alert(
            `Não dá para publicar ainda: ${issues.map((i) => QUALITY_LABELS[i]).join(', ')}. Abra a edição.`,
          )
          return
        }
      }
      await saveAdminPropertyDb({ ...p, status: nextStatus, updatedAt: new Date().toISOString() })
      await reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao atualizar status')
    }
  }

  const toggleFeatured = async (p: AdminProperty) => {
    try {
      await setPropertyFeatured(p.id, !p.isFeatured, !p.isFeatured ? Date.now() : 0)
      await reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao destacar')
    }
  }

  const filtered = useMemo(() => {
    if (!items) return []
    const query = q.trim().toLowerCase()
    let list = items.filter((p) => {
      if (status !== 'todos' && p.status !== status) return false
      if (kind !== 'todos' && p.kind !== kind) return false
      if (mode !== 'todos' && p.mode !== mode) return false
      if (city !== 'todos' && p.cityKey !== city) return false
      if (!query) return true
      const hay = [
        p.id,
        p.title,
        p.empreendimento,
        p.unidade,
        p.unitName,
        p.city,
        p.cityKey,
        p.location,
        p.address,
        p.price,
        p.sourceUrl,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(query)
    })

    list = [...list]
    if (sortBy === 'titulo') {
      list.sort((a, b) =>
        (a.empreendimento || a.title).localeCompare(b.empreendimento || b.title, 'pt-BR'),
      )
    } else if (sortBy === 'preco-asc') {
      list.sort(
        (a, b) => (a.priceValue ?? Number.MAX_SAFE_INTEGER) - (b.priceValue ?? Number.MAX_SAFE_INTEGER),
      )
    } else if (sortBy === 'preco-desc') {
      list.sort((a, b) => (b.priceValue ?? 0) - (a.priceValue ?? 0))
    } else {
      list.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
    }
    return list
  }, [items, q, status, kind, mode, city, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const clearFilters = () => {
    setQ('')
    setStatus('todos')
    setKind('todos')
    setMode('todos')
    setCity('todos')
    setSortBy('recente')
    setPage(1)
  }

  const hasActiveFilters =
    q.trim() !== '' ||
    status !== 'todos' ||
    kind !== 'todos' ||
    mode !== 'todos' ||
    city !== 'todos' ||
    sortBy !== 'recente'

  if (items === null) {
    return <p className="text-[#6f7680] text-sm">Carregando…</p>
  }

  const ready = items.filter((p) => p.status === 'pronto').length
  const drafts = items.length - ready

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[1.85rem] sm:text-[2rem] text-[#0b1420] leading-tight">
            Imóveis cadastrados
          </h1>
          <p className="mt-1.5 text-[0.9rem] text-[#6f7680] max-w-[48ch]">
            Busque, filtre e paginação — dados no Supabase.
          </p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="inline-flex items-center justify-center min-h-[46px] px-5 bg-[#0e6b7a] text-white text-[0.72rem] font-semibold tracking-[.1em] uppercase hover:bg-[#095260] transition-colors shadow-[0_8px_24px_rgba(14,107,122,.25)]"
        >
          Cadastrar imóvel
        </Link>
      </div>

      {error && (
        <div className="bg-[#fdf2f2] border border-[#f0d4d4] px-4 py-3 text-[0.88rem] text-[#9b3b3b] space-y-2">
          <p>{error}</p>
          <p className="text-[0.8rem] text-[#6f7680]">
            No Supabase → SQL Editor, execute o arquivo <code>supabase/schema.sql</code> do
            projeto e recarregue.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-[#ebe8e2] px-4 py-3">
            <p className="text-[0.58rem] font-semibold tracking-[.14em] uppercase text-[#9aa0a6]">
              Total
            </p>
            <p className="mt-1 text-[1.35rem] font-semibold text-[#0b1420]">{items.length}</p>
          </div>
          <div className="bg-white border border-[#ebe8e2] px-4 py-3">
            <p className="text-[0.58rem] font-semibold tracking-[.14em] uppercase text-[#9aa0a6]">
              Prontos
            </p>
            <p className="mt-1 text-[1.35rem] font-semibold text-[#1f6b4a]">{ready}</p>
          </div>
          <div className="bg-white border border-[#ebe8e2] px-4 py-3">
            <p className="text-[0.58rem] font-semibold tracking-[.14em] uppercase text-[#9aa0a6]">
              Rascunhos
            </p>
            <p className="mt-1 text-[1.35rem] font-semibold text-[#8a7040]">{drafts}</p>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-white border border-[#ebe8e2] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.62rem] font-semibold tracking-[.14em] uppercase text-[#7a818a]">
              Filtrar
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[0.65rem] font-semibold tracking-[.1em] uppercase text-[#0e6b7a] hover:opacity-80"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, unidade, cidade, código, link DWV…"
            className="w-full min-h-[42px] border border-[#ddd7cc] px-3 text-[0.9rem] outline-none focus:border-[#0e6b7a]"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className={filterSelectClass(status !== 'todos')}
              aria-label="Status"
            >
              <option value="todos">Status: todos</option>
              <option value="pronto">Prontos</option>
              <option value="rascunho">Rascunhos</option>
            </select>

            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as KindFilter)}
              className={filterSelectClass(kind !== 'todos')}
              aria-label="Tipo"
            >
              <option value="todos">Tipo: todos</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
            </select>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ModeFilter)}
              className={filterSelectClass(mode !== 'todos')}
              aria-label="Finalidade"
            >
              <option value="todos">Finalidade: todas</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={filterSelectClass(city !== 'todos')}
              aria-label="Cidade"
            >
              <option value="todos">Cidade: todas</option>
              {CITY_FILTERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className={filterSelectClass(sortBy !== 'recente')}
              aria-label="Ordenar"
            >
              <option value="recente">Ordenar: recente</option>
              <option value="titulo">Título A–Z</option>
              <option value="preco-asc">Menor preço</option>
              <option value="preco-desc">Maior preço</option>
            </select>
          </div>

          <p className="text-[0.78rem] text-[#6f7680]">
            {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
            {hasActiveFilters ? ' com os filtros atuais' : ''}
            {filtered.length > PAGE_SIZE
              ? ` · página ${safePage} de ${totalPages}`
              : null}
          </p>
        </div>
      )}

      {items.length === 0 && !error ? (
        <div className="bg-white border border-[#ebe8e2] overflow-hidden">
          <div className="p-7 sm:p-9">
            <p className="text-[0.62rem] font-semibold tracking-[.16em] uppercase text-[#0e6b7a] mb-3">
              Como funciona
            </p>
            <h2 className="font-serif text-[1.45rem] text-[#0b1420] leading-snug mb-5">
              Cadastre em 3 passos
            </h2>
            <ol className="space-y-4 text-[0.92rem] text-[#4a5560]">
              <li>
                <strong className="text-[#0b1420] font-medium">1.</strong> Cole o texto do anúncio
              </li>
              <li>
                <strong className="text-[#0b1420] font-medium">2.</strong> Revise empreendimento,
                unidade e endereço
              </li>
              <li>
                <strong className="text-[#0b1420] font-medium">3.</strong> Envie as fotos e salve
              </li>
            </ol>
            <Link
              href="/admin/imoveis/novo"
              className="mt-7 inline-flex min-h-[46px] items-center px-5 bg-[#0b1420] text-white text-[0.72rem] font-semibold tracking-[.1em] uppercase hover:bg-[#162033]"
            >
              Começar agora
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#ebe8e2] px-5 py-8 text-center">
          <p className="text-[0.95rem] text-[#4a5560]">Nenhum imóvel com esses filtros.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-[0.68rem] font-semibold tracking-[.1em] uppercase text-[#0e6b7a]"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {pageItems.map((p) => (
              <li
                key={p.id}
                className="bg-white border border-[#ebe8e2] flex flex-wrap sm:flex-nowrap items-stretch gap-0 hover:border-[#cfc8bc] transition-colors"
              >
                <div className="w-full sm:w-[120px] shrink-0 bg-[#ece9e3] aspect-[16/10] sm:aspect-auto sm:min-h-[100px] overflow-hidden">
                  {p.coverPath || p.imageAssets?.[0] || p.images?.[0] || p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        storageUrl(p.coverPath || p.imageAssets?.[0]?.path) ||
                        p.images?.[0] ||
                        p.image
                      }
                      alt=""
                      width={p.imageAssets?.[0]?.width || undefined}
                      height={p.imageAssets?.[0]?.height || undefined}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[100px] flex items-center justify-center text-[0.7rem] text-[#9aa0a6]">
                      Sem foto
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-medium text-[1.02rem] text-[#0b1420] truncate">
                        {formatPropertyTitle(
                          p.empreendimento || p.unitName || p.title,
                          p.unidade,
                        ) || p.title}
                      </h2>
                      <StatusPill status={p.status} />
                      {p.isFeatured && (
                        <span className="text-[0.55rem] font-semibold tracking-[.08em] uppercase bg-[#e8f4f6] text-[#0e6b7a] px-1.5 py-0.5">
                          Destaque
                        </span>
                      )}
                    </div>
                    {propertyQualityIssues(p).length > 0 && (
                      <div className="mb-1.5 flex flex-wrap gap-1">
                        {propertyQualityIssues(p).map((i) => (
                          <span
                            key={i}
                            className="text-[0.55rem] font-semibold tracking-[.06em] uppercase bg-[#fff4e0] text-[#8a7040] px-1.5 py-0.5"
                          >
                            {QUALITY_LABELS[i]}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[0.84rem] text-[#6f7680]">
                      {p.cityKey || '—'}
                      <span className="mx-1.5 text-[#d0cbc2]">·</span>
                      {p.kind === 'apartamento' ? 'Apartamento' : 'Casa'}
                      <span className="mx-1.5 text-[#d0cbc2]">·</span>
                      {p.mode === 'venda' ? 'Venda' : 'Aluguel'}
                      <span className="mx-1.5 text-[#d0cbc2]">·</span>
                      {p.bedrooms} dorm.
                    </p>
                    <p className="mt-1 text-[0.95rem] font-semibold text-[#0b1420]">{p.price}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {p.status === 'pronto' ? (
                      <button
                        type="button"
                        onClick={() => void updateListingStatus(p, 'rascunho')}
                        className="min-h-[42px] px-3 text-[0.62rem] font-semibold tracking-[.08em] uppercase border border-[#ebe8e2] text-[#6f7680]"
                      >
                        Rascunho
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void updateListingStatus(p, 'pronto')}
                        className="min-h-[42px] px-3 text-[0.62rem] font-semibold tracking-[.08em] uppercase border border-[#c5e0d4] text-[#1f6b4a]"
                      >
                        Publicar
                      </button>
                    )}
                    {p.status === 'pronto' && (
                      <button
                        type="button"
                        onClick={() => void toggleFeatured(p)}
                        className="min-h-[42px] px-3 text-[0.62rem] font-semibold tracking-[.08em] uppercase border border-[#ebe8e2] text-[#0e6b7a]"
                      >
                        {p.isFeatured ? 'Tirar destaque' : 'Destacar'}
                      </button>
                    )}
                    {p.status === 'pronto' && (
                      <Link
                        href={propertyPublicPath(p.id, p.mode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none min-h-[42px] px-4 inline-flex items-center justify-center text-[0.68rem] font-semibold tracking-[.1em] uppercase border border-[#ebe8e2] text-[#0e6b7a] hover:bg-[#e8f4f6]"
                      >
                        Ver no site
                      </Link>
                    )}
                    <Link
                      href={`/admin/imoveis/${p.id}`}
                      className="flex-1 sm:flex-none min-h-[42px] px-4 inline-flex items-center justify-center text-[0.68rem] font-semibold tracking-[.1em] uppercase bg-[#0b1420] text-white hover:bg-[#162033]"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => void onDelete(p.id)}
                      className="min-h-[42px] px-3 text-[0.68rem] font-semibold tracking-[.1em] uppercase text-[#9b3b3b] hover:bg-[#fdf2f2]"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#ebe8e2] px-4 py-3">
              <p className="text-[0.78rem] text-[#6f7680]">
                Mostrando {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="min-h-[38px] px-3 text-[0.65rem] font-semibold tracking-[.1em] uppercase border border-[#ddd7cc] disabled:opacity-40 hover:border-[#0e6b7a]"
                >
                  Anterior
                </button>
                <span className="text-[0.82rem] text-[#0b1420] min-w-[4.5rem] text-center">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="min-h-[38px] px-3 text-[0.65rem] font-semibold tracking-[.1em] uppercase border border-[#ddd7cc] disabled:opacity-40 hover:border-[#0e6b7a]"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
