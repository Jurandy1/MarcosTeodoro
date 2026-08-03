'use client'

import { FormEvent, useEffect, useState, type ChangeEvent } from 'react'
import { fetchSiteSettings, saveSiteSettings, type SiteSettings } from '@/lib/supabase/settings-api'

const empty: Partial<SiteSettings> = {
  company_name: '',
  creci: '',
  phone: '',
  whatsapp: '',
  email: '',
  instagram: '',
  address: '',
  topbar_text: '',
}

export default function AdminContatosPage() {
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
            company_name: s.company_name ?? '',
            creci: s.creci ?? '',
            phone: s.phone ?? '',
            whatsapp: s.whatsapp ?? '',
            email: s.email ?? '',
            instagram: s.instagram ?? '',
            address: s.address ?? '',
            topbar_text: s.topbar_text ?? '',
          })
        }
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Erro ao carregar contatos')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const set =
    (key: keyof typeof empty) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
    }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      await saveSiteSettings(form)
      setMsg('Contatos salvos — já aplicados no topo, rodapé e WhatsApp do site.')
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
        <h1 className="font-serif text-[1.75rem] text-[#0b1420]">Contatos</h1>
        <p className="mt-1 text-[0.88rem] text-[#6f7680]">
          Dados que aparecem no topo, rodapé e botões de WhatsApp gerais do site.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-[#ebe8e2] p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Nome / marca</label>
            <input className={field} value={form.company_name ?? ''} onChange={set('company_name')} />
          </div>
          <div>
            <label className={label}>CRECI</label>
            <input className={field} value={form.creci ?? ''} onChange={set('creci')} />
          </div>
          <div>
            <label className={label}>Telefone</label>
            <input className={field} value={form.phone ?? ''} onChange={set('phone')} placeholder="4799…" />
          </div>
          <div>
            <label className={label}>WhatsApp (com DDI)</label>
            <input
              className={field}
              value={form.whatsapp ?? ''}
              onChange={set('whatsapp')}
              placeholder="554799…"
            />
          </div>
          <div>
            <label className={label}>E-mail</label>
            <input className={field} type="email" value={form.email ?? ''} onChange={set('email')} />
          </div>
          <div>
            <label className={label}>Instagram</label>
            <input
              className={field}
              value={form.instagram ?? ''}
              onChange={set('instagram')}
              placeholder="@usuario"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Texto da barra superior</label>
            <input className={field} value={form.topbar_text ?? ''} onChange={set('topbar_text')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Endereço / região</label>
            <textarea className={field} rows={2} value={form.address ?? ''} onChange={set('address')} />
          </div>
        </div>

        {msg && <p className="text-[0.88rem] text-[#0e6b7a]">{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] px-5 bg-[#0e6b7a] text-white text-[0.7rem] font-semibold tracking-[.1em] uppercase disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar contatos'}
        </button>
      </form>
    </div>
  )
}
