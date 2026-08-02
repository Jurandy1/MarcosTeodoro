'use client'

import { useMemo, useState } from 'react'

/**
 * Select com opção de cadastrar novo valor (empreendimento / unidade).
 */
export function CreatableSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
  hint,
  disabled,
}: {
  label: string
  value: string
  options: string[]
  placeholder?: string
  onChange: (value: string) => void
  hint?: string
  disabled?: boolean
}) {
  const [creating, setCreating] = useState(false)

  const sorted = useMemo(() => {
    const all = [...options]
    if (value && !all.includes(value)) all.push(value)
    return [...new Set(all.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [options, value])

  const field =
    'w-full border border-[#ddd7cc] bg-white px-3 py-2.5 text-[0.9rem] text-[#0b1420] outline-none focus:border-[#0e6b7a] focus:ring-1 focus:ring-[#0e6b7a]/25'
  const lab =
    'block text-[0.65rem] font-semibold tracking-[.1em] uppercase text-[#7a818a] mb-1.5'

  if (creating) {
    return (
      <div>
        <label className={lab}>{label}</label>
        <input
          className={field}
          value={value}
          disabled={disabled}
          placeholder={placeholder || 'Digite o nome'}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {hint && <p className="text-[0.72rem] text-[#9aa0a6] flex-1">{hint}</p>}
          <button
            type="button"
            className="text-[0.68rem] font-semibold tracking-[.08em] uppercase text-[#0e6b7a]"
            onClick={() => {
              setCreating(false)
              if (value && !options.includes(value)) {
                // mantém o valor digitado na lista efetiva
                return
              }
              onChange(options[0] || '')
            }}
          >
            Escolher da lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className={lab}>{label}</label>
      <select
        className={field}
        disabled={disabled}
        value={sorted.includes(value) ? value : ''}
        onChange={(e) => {
          if (e.target.value === '__new__') {
            setCreating(true)
            onChange('')
            return
          }
          onChange(e.target.value)
        }}
      >
        <option value="">{placeholder || 'Selecione…'}</option>
        {sorted.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="__new__">+ Cadastrar novo…</option>
      </select>
      {hint && <p className="mt-1.5 text-[0.72rem] text-[#9aa0a6]">{hint}</p>}
    </div>
  )
}
