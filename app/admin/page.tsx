'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchAdminProperties } from '@/lib/supabase/properties-api'
import { fetchConsultants, fetchSiteSettings } from '@/lib/supabase/settings-api'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    drafts: 0,
    featured: 0,
    consultants: 0,
  })
  const [seoTitle, setSeoTitle] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const [props, consultants, settings] = await Promise.all([
          fetchAdminProperties(),
          fetchConsultants(true).catch(() => []),
          fetchSiteSettings().catch(() => null),
        ])
        setStats({
          total: props.length,
          ready: props.filter((p) => p.status === 'pronto').length,
          drafts: props.filter((p) => p.status === 'rascunho').length,
          featured: props.filter((p) => (p as { isFeatured?: boolean }).isFeatured).length,
          consultants: consultants.length,
        })
        setSeoTitle(settings?.seo_title ?? null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar painel')
      }
    })()
  }, [])

  const cards = [
    { label: 'Imóveis', value: stats.total, href: '/admin/imoveis' },
    { label: 'Prontos', value: stats.ready, href: '/admin/imoveis' },
    { label: 'Rascunhos', value: stats.drafts, href: '/admin/imoveis' },
    { label: 'Consultores', value: stats.consultants, href: '/admin/consultores' },
  ]

  const shortcuts = [
    { href: '/admin/imoveis/novo', title: 'Cadastrar imóvel', desc: 'Colar anúncio, fotos e salvar' },
    { href: '/admin/imoveis', title: 'Imóveis cadastrados', desc: 'Editar, excluir e revisar status' },
    { href: '/admin/destaques', title: 'Destaques da home', desc: 'Escolher o que aparece em evidência' },
    { href: '/admin/consultores', title: 'Consultores', desc: 'WhatsApp por faixa de investimento' },
    { href: '/admin/contatos', title: 'Contatos do site', desc: 'Telefone, e-mail, CRECI, Instagram' },
    { href: '/admin/seo', title: 'SEO', desc: 'Título, descrição e palavras-chave' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-[1.85rem] sm:text-[2.1rem] text-[#0b1420] leading-tight">
          Painel
        </h1>
        <p className="mt-1.5 text-[0.9rem] text-[#6f7680] max-w-[52ch]">
          Gerencie imóveis, destaques, consultores, contatos e SEO do site.
        </p>
      </div>

      {error && (
        <div className="bg-[#fdf2f2] border border-[#f0d4d4] px-4 py-3 text-[0.88rem] text-[#9b3b3b]">
          {error}
          <p className="mt-2 text-[0.8rem] text-[#6f7680]">
            Se as tabelas novas ainda não existem, rode também{' '}
            <code>supabase/schema-admin-v2.sql</code> no SQL Editor.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white border border-[#ebe8e2] px-4 py-4 hover:border-[#cfc8bc] transition-colors"
          >
            <p className="text-[0.58rem] font-semibold tracking-[.14em] uppercase text-[#9aa0a6]">
              {c.label}
            </p>
            <p className="mt-1 text-[1.5rem] font-semibold text-[#0b1420]">{c.value}</p>
          </Link>
        ))}
      </div>

      {seoTitle && (
        <div className="bg-white border border-[#ebe8e2] px-4 py-3 text-[0.85rem] text-[#4a5560]">
          <span className="text-[0.58rem] font-semibold tracking-[.12em] uppercase text-[#9aa0a6]">
            SEO atual ·{' '}
          </span>
          {seoTitle}
        </div>
      )}

      <div>
        <h2 className="text-[0.72rem] font-semibold tracking-[.14em] uppercase text-[#6f7680] mb-3">
          Atalhos
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="bg-white border border-[#ebe8e2] p-4 hover:border-[#0e6b7a]/40 transition-colors"
            >
              <p className="font-medium text-[#0b1420]">{s.title}</p>
              <p className="mt-1 text-[0.82rem] text-[#6f7680]">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
