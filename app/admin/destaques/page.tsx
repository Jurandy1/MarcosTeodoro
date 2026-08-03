'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { AdminProperty } from '@/lib/admin-store'
import { fetchAdminProperties } from '@/lib/supabase/properties-api'
import { setPropertyFeatured } from '@/lib/supabase/settings-api'
import { formatPropertyTitle } from '@/lib/property-title'

export default function AdminDestaquesPage() {
  const [items, setItems] = useState<AdminProperty[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    const all = await fetchAdminProperties()
    setItems(all.filter((p) => p.status === 'pronto' || p.isFeatured))
  }

  useEffect(() => {
    void (async () => {
      try {
        await reload()
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Erro ao carregar')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const featured = useMemo(
    () =>
      items
        .filter((p) => p.isFeatured)
        .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0)),
    [items],
  )
  const candidates = items.filter((p) => p.status === 'pronto')

  const toggle = async (p: AdminProperty) => {
    try {
      setBusy(true)
      const next = !p.isFeatured
      const order = next ? (featured.length > 0 ? Math.max(...featured.map((f) => f.featuredOrder ?? 0)) + 10 : 10) : 0
      await setPropertyFeatured(p.id, next, order)
      setMsg(
        next
          ? `${formatPropertyTitle(p.empreendimento || p.title, p.unidade)} em destaque na home.`
          : 'Removido dos destaques.',
      )
      await reload()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro ao atualizar')
    } finally {
      setBusy(false)
    }
  }

  const move = async (index: number, dir: -1 | 1) => {
    const list = [...featured]
    const j = index + dir
    if (j < 0 || j >= list.length) return
    ;[list[index], list[j]] = [list[j], list[index]]
    try {
      setBusy(true)
      await Promise.all(
        list.map((p, i) => setPropertyFeatured(p.id, true, (i + 1) * 10)),
      )
      setMsg('Ordem dos destaques atualizada — vale para o carrossel da home.')
      await reload()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro ao reordenar')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-[#6f7680]">Carregando…</p>

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-serif text-[1.75rem] text-[#0b1420]">Destaques</h1>
        <p className="mt-1 text-[0.88rem] text-[#6f7680] max-w-[56ch]">
          A ordem abaixo define quem aparece primeiro no carrossel da home (Apartamentos / Casas).
          O efeito de scroll automático permanece.
        </p>
      </div>

      {msg && <p className="text-[0.88rem] text-[#0e6b7a]">{msg}</p>}

      <section className="space-y-3">
        <h2 className="text-[0.72rem] font-semibold tracking-[.12em] uppercase text-[#6f7680]">
          Em destaque agora ({featured.length})
        </h2>
        {featured.length === 0 ? (
          <p className="text-[0.88rem] text-[#9aa0a6] border border-dashed border-[#d8d2c8] px-4 py-6 text-center">
            Nenhum destaque — a home mostra todos os imóveis prontos.
          </p>
        ) : (
          <ul className="space-y-2">
            {featured.map((p, i) => (
              <li
                key={p.id}
                className="bg-white border border-[#ebe8e2] px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[0.62rem] text-[#9aa0a6] mb-0.5">#{i + 1}</p>
                  <p className="font-medium text-[#0b1420]">
                    {formatPropertyTitle(p.empreendimento || p.title, p.unidade) || p.title}
                  </p>
                  <p className="text-[0.8rem] text-[#6f7680]">
                    {p.cityKey} · {p.price} · {p.kind === 'casa' ? 'Casa' : 'Apto'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || i === 0}
                    onClick={() => void move(i, -1)}
                    className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.08em] uppercase border border-[#ebe8e2] disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={busy || i === featured.length - 1}
                    onClick={() => void move(i, 1)}
                    className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.08em] uppercase border border-[#ebe8e2] disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void toggle(p)}
                    className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.08em] uppercase text-[#9b3b3b] border border-[#f0d4d4]"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-[0.72rem] font-semibold tracking-[.12em] uppercase text-[#6f7680]">
          Imóveis prontos
        </h2>
        {candidates.length === 0 ? (
          <p className="text-[0.88rem] text-[#6f7680]">
            Nenhum imóvel pronto.{' '}
            <Link href="/admin/imoveis/novo" className="text-[#0e6b7a] underline">
              Cadastrar
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {candidates.map((p) => (
              <li
                key={p.id}
                className="bg-white border border-[#ebe8e2] px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-[#0b1420]">
                    {formatPropertyTitle(p.empreendimento || p.title, p.unidade) || p.title}
                  </p>
                  <p className="text-[0.8rem] text-[#6f7680]">
                    {p.cityKey} · {p.price}
                    {p.isFeatured ? ' · já em destaque' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void toggle(p)}
                  className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.08em] uppercase bg-[#0b1420] text-white disabled:opacity-50"
                >
                  {p.isFeatured ? 'Remover' : 'Destacar'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
