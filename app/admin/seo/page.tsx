'use client'

import { FormEvent, useEffect, useState } from 'react'
import { fetchSiteSettings, saveSiteSettings, type SiteSettings } from '@/lib/supabase/settings-api'

const empty: Partial<SiteSettings> = {
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  og_image_url: '',
}

export default function AdminSeoPage() {
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const s = await fetchSiteSettings()
        if (s) {
          setForm({
            seo_title: s.seo_title ?? '',
            seo_description: s.seo_description ?? '',
            seo_keywords: s.seo_keywords ?? '',
            og_image_url: s.og_image_url ?? '',
          })
        }
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Erro ao carregar SEO')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      await saveSiteSettings(form)
      setMsg('SEO salvo — já aplicado no site público (pode levar alguns segundos no cache).')
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const field =
    'w-full border border-[#ddd7cc] bg-white px-3 py-2.5 text-[0.9rem] outline-none focus:border-[#0e6b7a]'
  const label =
    'block text-[0.65rem] font-semibold tracking-[.1em] uppercase text-[#7a818a] mb-1.5'

  if (loading) return <p className="text-[#6f7680]">Carregando…</p>

  return (
    <div className="space-y-6 max-w-[720px]">
      <div>
        <h1 className="font-serif text-[1.75rem] text-[#0b1420]">SEO</h1>
        <p className="mt-1 text-[0.88rem] text-[#6f7680]">
          Título, descrição e palavras-chave que o Google e o WhatsApp usam ao compartilhar o site.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-[#ebe8e2] p-5 space-y-4">
        <div>
          <label className={label}>Título da página</label>
          <input
            className={field}
            value={form.seo_title ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
            maxLength={70}
          />
          <p className="mt-1 text-[0.72rem] text-[#9aa0a6]">
            {(form.seo_title ?? '').length}/70 · ideal até 60 caracteres
          </p>
        </div>
        <div>
          <label className={label}>Meta description</label>
          <textarea
            className={field}
            rows={4}
            value={form.seo_description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
            maxLength={170}
          />
          <p className="mt-1 text-[0.72rem] text-[#9aa0a6]">
            {(form.seo_description ?? '').length}/170 · ideal até 155 caracteres
          </p>
        </div>
        <div>
          <label className={label}>Palavras-chave</label>
          <input
            className={field}
            value={form.seo_keywords ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, seo_keywords: e.target.value }))}
            placeholder="corretor, Itapema, imóveis…"
          />
        </div>
        <div>
          <label className={label}>Imagem de compartilhamento (URL)</label>
          <input
            className={field}
            value={form.og_image_url ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, og_image_url: e.target.value }))}
            placeholder="https://…"
          />
        </div>

        {msg && <p className="text-[0.88rem] text-[#0e6b7a]">{msg}</p>}

        <div className="border border-[#ebe8e2] bg-[#faf9f7] p-4">
          <p className="text-[0.58rem] font-semibold tracking-[.12em] uppercase text-[#9aa0a6] mb-2">
            Prévia no Google
          </p>
          <p className="text-[1.05rem] text-[#1a0dab] leading-snug truncate">
            {form.seo_title || 'Título da página'}
          </p>
          <p className="text-[0.78rem] text-[#006621] mt-0.5">marcosteodoro.com.br</p>
          <p className="text-[0.82rem] text-[#4a5560] mt-1 line-clamp-2">
            {form.seo_description || 'Meta description aparece aqui.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] px-5 bg-[#0e6b7a] text-white text-[0.7rem] font-semibold tracking-[.1em] uppercase disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar SEO'}
        </button>
      </form>
    </div>
  )
}
