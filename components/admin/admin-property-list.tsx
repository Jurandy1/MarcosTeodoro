'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { AdminProperty } from '@/lib/admin-store'
import { storageUrl } from '@/lib/storage'
import {
  deleteAdminPropertyDb,
  fetchAdminProperties,
} from '@/lib/supabase/properties-api'

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

export function AdminPropertyList() {
  const [items, setItems] = useState<AdminProperty[] | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const onDelete = async (id: string) => {
    if (!confirm('Excluir este imóvel?')) return
    try {
      await deleteAdminPropertyDb(id)
      await reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

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
            Dados salvos no Supabase. Cole o anúncio, revise e envie as fotos.
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
      ) : (
        <ul className="space-y-3">
          {items.map((p) => (
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
                      {p.empreendimento || p.unitName || p.title}
                      {p.unidade ? ` — ${p.unidade}` : ''}
                    </h2>
                    <StatusPill status={p.status} />
                  </div>
                  <p className="text-[0.84rem] text-[#6f7680]">
                    {p.cityKey}
                    <span className="mx-1.5 text-[#d0cbc2]">·</span>
                    {p.kind === 'apartamento' ? 'Apartamento' : 'Casa'}
                    <span className="mx-1.5 text-[#d0cbc2]">·</span>
                    {p.bedrooms} dorm.
                  </p>
                  <p className="mt-1 text-[0.95rem] font-semibold text-[#0b1420]">{p.price}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
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
      )}
    </div>
  )
}
