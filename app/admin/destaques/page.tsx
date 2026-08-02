'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AdminProperty } from '@/lib/admin-store'
import { fetchAdminProperties } from '@/lib/supabase/properties-api'
import { setPropertyFeatured } from '@/lib/supabase/settings-api'

export default function AdminDestaquesPage() {
  const [items, setItems] = useState<AdminProperty[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  const toggle = async (p: AdminProperty) => {
    try {
      const next = !p.isFeatured
      await setPropertyFeatured(p.id, next, next ? Date.now() : 0)
      setMsg(next ? `${p.title} marcado como destaque.` : `${p.title} removido dos destaques.`)
      await reload()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro ao atualizar')
    }
  }

  if (loading) return <p className="text-[#6f7680]">Carregando…</p>

  const featured = items.filter((p) => p.isFeatured)
  const candidates = items.filter((p) => p.status === 'pronto')

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-serif text-[1.75rem] text-[#0b1420]">Destaques</h1>
        <p className="mt-1 text-[0.88rem] text-[#6f7680] max-w-[56ch]">
          Escolha quais imóveis prontos aparecem em evidência no site.
        </p>
      </div>

      {msg && <p className="text-[0.88rem] text-[#0e6b7a]">{msg}</p>}

      <section className="space-y-3">
        <h2 className="text-[0.72rem] font-semibold tracking-[.12em] uppercase text-[#6f7680]">
          Em destaque agora ({featured.length})
        </h2>
        {featured.length === 0 ? (
          <p className="text-[0.88rem] text-[#9aa0a6] border border-dashed border-[#d8d2c8] px-4 py-6 text-center">
            Nenhum destaque selecionado.
          </p>
        ) : (
          <ul className="space-y-2">
            {featured.map((p) => (
              <li
                key={p.id}
                className="bg-white border border-[#ebe8e2] px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-[#0b1420]">
                    {p.empreendimento || p.title}
                    {p.unidade ? ` — ${p.unidade}` : ''}
                  </p>
                  <p className="text-[0.8rem] text-[#6f7680]">
                    {p.cityKey} · {p.price}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggle(p)}
                  className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.08em] uppercase text-[#9b3b3b] border border-[#f0d4d4]"
                >
                  Remover
                </button>
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
                    {p.empreendimento || p.title}
                    {p.unidade ? ` — ${p.unidade}` : ''}
                  </p>
                  <p className="text-[0.8rem] text-[#6f7680]">
                    {p.cityKey} · {p.price}
                    {p.isFeatured ? ' · já em destaque' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggle(p)}
                  className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.08em] uppercase bg-[#0b1420] text-white"
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
