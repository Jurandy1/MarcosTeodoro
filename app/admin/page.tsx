'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { AdminProperty } from '@/lib/admin-store'
import { fetchAdminProperties } from '@/lib/supabase/properties-api'
import { fetchConsultants, fetchSiteSettings } from '@/lib/supabase/settings-api'
import {
  propertyQualityIssues,
  QUALITY_LABELS,
  type QualityIssue,
} from '@/lib/property-quality'

export default function AdminDashboardPage() {
  const [props, setProps] = useState<AdminProperty[]>([])
  const [consultants, setConsultants] = useState(0)
  const [seoTitle, setSeoTitle] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const [list, cons, settings] = await Promise.all([
          fetchAdminProperties(),
          fetchConsultants(true).catch(() => []),
          fetchSiteSettings().catch(() => null),
        ])
        setProps(list)
        setConsultants(cons.length)
        setSeoTitle(settings?.seo_title ?? null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar painel')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const stats = useMemo(() => {
    const ready = props.filter((p) => p.status === 'pronto')
    const drafts = props.filter((p) => p.status === 'rascunho')
    const featured = props.filter((p) => p.isFeatured)
    const noPhoto = props.filter((p) => propertyQualityIssues(p).includes('sem_foto'))
    const noCity = props.filter((p) => propertyQualityIssues(p).includes('sem_cidade'))
    const sobConsulta = props.filter((p) => propertyQualityIssues(p).includes('sob_consulta'))
    return {
      total: props.length,
      ready: ready.length,
      drafts: drafts.length,
      featured: featured.length,
      noPhoto: noPhoto.length,
      noCity: noCity.length,
      sobConsulta: sobConsulta.length,
      consultants,
    }
  }, [props, consultants])

  const qualityQueue = useMemo(() => {
    return props
      .map((p) => ({ p, issues: propertyQualityIssues(p) }))
      .filter((x) => x.issues.length > 0)
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 12)
  }, [props])

  const cards = [
    { label: 'Imóveis', value: stats.total, href: '/admin/imoveis' },
    { label: 'Prontos', value: stats.ready, href: '/admin/imoveis' },
    { label: 'Rascunhos', value: stats.drafts, href: '/admin/imoveis' },
    { label: 'Destaques', value: stats.featured, href: '/admin/destaques' },
    { label: 'Sem foto', value: stats.noPhoto, href: '/admin/imoveis', warn: true },
    { label: 'Sem cidade', value: stats.noCity, href: '/admin/imoveis', warn: true },
    { label: 'Sob consulta', value: stats.sobConsulta, href: '/admin/imoveis', warn: true },
    { label: 'Consultores', value: stats.consultants, href: '/admin/consultores' },
  ]

  const shortcuts = [
    { href: '/admin/imoveis/novo', title: 'Cadastrar imóvel', desc: 'Colar anúncio, fotos e salvar' },
    { href: '/admin/imoveis', title: 'Imóveis cadastrados', desc: 'Editar, alertas e status' },
    { href: '/admin/destaques', title: 'Destaques da home', desc: 'Ordem do carrossel' },
    { href: '/admin/consultores', title: 'Consultores', desc: 'WhatsApp por faixa' },
    { href: '/admin/contatos', title: 'Contatos do site', desc: 'Telefone, CRECI, Instagram' },
    { href: '/admin/seo', title: 'SEO', desc: 'Título e descrição do Google' },
  ]

  if (loading) return <p className="text-[#6f7680]">Carregando…</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-[1.85rem] sm:text-[2.1rem] text-[#0b1420] leading-tight">
          Painel
        </h1>
        <p className="mt-1.5 text-[0.9rem] text-[#6f7680] max-w-[52ch]">
          Visão geral, fila de qualidade e atalhos do site.
        </p>
      </div>

      {error && (
        <div className="bg-[#fdf2f2] border border-[#f0d4d4] px-4 py-3 text-[0.88rem] text-[#9b3b3b]">
          {error}
          <p className="mt-2 text-[0.8rem] text-[#6f7680]">
            Se as tabelas novas ainda não existem, rode{' '}
            <code>supabase/schema-admin-v2.sql</code> e{' '}
            <code>supabase/schema-property-description.sql</code> no SQL Editor.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`bg-white border px-4 py-4 hover:border-[#cfc8bc] transition-colors ${
              c.warn && c.value > 0 ? 'border-[#e8d9a8]' : 'border-[#ebe8e2]'
            }`}
          >
            <p className="text-[0.58rem] font-semibold tracking-[.14em] uppercase text-[#9aa0a6]">
              {c.label}
            </p>
            <p
              className={`mt-1 text-[1.5rem] font-semibold ${
                c.warn && c.value > 0 ? 'text-[#8a7040]' : 'text-[#0b1420]'
              }`}
            >
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      {seoTitle && (
        <div className="bg-white border border-[#ebe8e2] px-4 py-3 text-[0.85rem] text-[#4a5560]">
          <span className="text-[0.58rem] font-semibold tracking-[.12em] uppercase text-[#9aa0a6]">
            SEO no ar ·{' '}
          </span>
          {seoTitle}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-[0.72rem] font-semibold tracking-[.14em] uppercase text-[#6f7680]">
          Fila de qualidade
        </h2>
        {qualityQueue.length === 0 ? (
          <p className="text-[0.88rem] text-[#1f6b4a] bg-[#e7f5ef] border border-[#c5e0d4] px-4 py-3">
            Nenhum alerta — imóveis com dados básicos ok.
          </p>
        ) : (
          <ul className="space-y-2">
            {qualityQueue.map(({ p, issues }) => (
              <li
                key={p.id}
                className="bg-white border border-[#ebe8e2] px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#0b1420] truncate">
                    {p.empreendimento || p.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {issues.map((i: QualityIssue) => (
                      <span
                        key={i}
                        className="text-[0.58rem] font-semibold tracking-[.06em] uppercase bg-[#fff4e0] text-[#8a7040] px-1.5 py-0.5"
                      >
                        {QUALITY_LABELS[i]}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/admin/imoveis/${p.id}`}
                  className="min-h-[36px] px-3 inline-flex items-center text-[0.65rem] font-semibold tracking-[.1em] uppercase bg-[#0b1420] text-white"
                >
                  Revisar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

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
