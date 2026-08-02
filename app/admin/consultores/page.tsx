'use client'

import { FormEvent, useEffect, useState } from 'react'
import {
  BUDGET_BANDS,
  deleteConsultant,
  fetchConsultants,
  saveConsultant,
  type Consultant,
} from '@/lib/supabase/settings-api'

const blank = {
  name: '',
  whatsapp: '',
  creci: '',
  budget_band: 'ate1m' as Consultant['budget_band'],
  budget_label: 'Até 1 milhão',
  active: true,
  sort_order: 0,
}

export default function AdminConsultoresPage() {
  const [items, setItems] = useState<Consultant[]>([])
  const [form, setForm] = useState(blank)
  const [editId, setEditId] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    setItems(await fetchConsultants(true))
  }

  useEffect(() => {
    void (async () => {
      try {
        await reload()
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Erro ao carregar consultores')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const startEdit = (c: Consultant) => {
    setEditId(c.id)
    setForm({
      name: c.name,
      whatsapp: c.whatsapp,
      creci: c.creci ?? '',
      budget_band: c.budget_band,
      budget_label: c.budget_label ?? BUDGET_BANDS.find((b) => b.id === c.budget_band)?.label ?? '',
      active: c.active,
      sort_order: c.sort_order,
    })
  }

  const reset = () => {
    setEditId(null)
    setForm(blank)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    try {
      await saveConsultant({
        ...(editId ? { id: editId } : {}),
        name: form.name.trim(),
        whatsapp: form.whatsapp.replace(/\D/g, ''),
        creci: form.creci.trim() || null,
        budget_band: form.budget_band,
        budget_label:
          form.budget_label || BUDGET_BANDS.find((b) => b.id === form.budget_band)?.label || null,
        active: form.active,
        sort_order: form.sort_order,
      })
      setMsg(editId ? 'Consultor atualizado.' : 'Consultor adicionado.')
      reset()
      await reload()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  const field =
    'w-full border border-[#ddd7cc] bg-white px-3 py-2.5 text-[0.9rem] outline-none focus:border-[#0e6b7a]'
  const label =
    'block text-[0.65rem] font-semibold tracking-[.1em] uppercase text-[#7a818a] mb-1.5'

  if (loading) return <p className="text-[#6f7680]">Carregando…</p>

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-serif text-[1.75rem] text-[#0b1420]">Consultores</h1>
        <p className="mt-1 text-[0.88rem] text-[#6f7680] max-w-[56ch]">
          Cada faixa de investimento no formulário “Falar com Marcos” pode ir para um consultor
          com WhatsApp próprio.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-[#ebe8e2] p-5 space-y-4">
        <h2 className="text-[0.72rem] font-semibold tracking-[.12em] uppercase text-[#0b1420]">
          {editId ? 'Editar consultor' : 'Adicionar consultor'}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Nome</label>
            <input
              className={field}
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className={label}>WhatsApp (DDI + DDD + número)</label>
            <input
              className={field}
              required
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              placeholder="5547991594019"
            />
          </div>
          <div>
            <label className={label}>CRECI (opcional)</label>
            <input
              className={field}
              value={form.creci}
              onChange={(e) => setForm((f) => ({ ...f, creci: e.target.value }))}
            />
          </div>
          <div>
            <label className={label}>Faixa de investimento</label>
            <select
              className={field}
              value={form.budget_band}
              onChange={(e) => {
                const band = e.target.value as Consultant['budget_band']
                setForm((f) => ({
                  ...f,
                  budget_band: band,
                  budget_label: BUDGET_BANDS.find((b) => b.id === band)?.label ?? f.budget_label,
                }))
              }}
            >
              {BUDGET_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            <label htmlFor="active" className="text-[0.88rem] text-[#4a5560]">
              Ativo no site
            </label>
          </div>
        </div>

        {msg && <p className="text-[0.88rem] text-[#0e6b7a]">{msg}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="min-h-[44px] px-5 bg-[#0e6b7a] text-white text-[0.7rem] font-semibold tracking-[.1em] uppercase"
          >
            {editId ? 'Salvar alterações' : 'Adicionar'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={reset}
              className="min-h-[44px] px-4 border border-[#d8d2c8] text-[0.7rem] font-semibold tracking-[.1em] uppercase"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="bg-white border border-[#ebe8e2] px-4 py-4 flex flex-wrap items-center gap-3 justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-[#0b1420]">
                {c.name}
                {!c.active && (
                  <span className="ml-2 text-[0.58rem] uppercase tracking-wide text-[#9aa0a6]">
                    inativo
                  </span>
                )}
              </p>
              <p className="text-[0.82rem] text-[#6f7680]">
                {c.budget_label || c.budget_band} · WhatsApp {c.whatsapp}
                {c.creci ? ` · ${c.creci}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(c)}
                className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.08em] uppercase border border-[#d8d2c8]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Excluir consultor?')) return
                  await deleteConsultant(c.id)
                  await reload()
                }}
                className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.08em] uppercase text-[#9b3b3b]"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-[0.88rem] text-[#6f7680] py-6 text-center border border-dashed border-[#d8d2c8]">
            Nenhum consultor ainda. Adicione o primeiro acima.
          </li>
        )}
      </ul>
    </div>
  )
}
