'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  BUDGET_BANDS,
  fetchConsultants,
  type Consultant,
} from '@/lib/supabase/settings-api'

const MARCOS_PHOTO_2 =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marcos-JBAkoIxvj0GDhvLLo503L00XTpnJTP.jpg'

const FALLBACK_BROKERS: Record<
  Consultant['budget_band'],
  { name: string; phone: string }
> = {
  ate1m: { name: 'Consultor', phone: '5547991594019' },
  de1a2: { name: 'Consultor', phone: '5547991594019' },
  de2a3: { name: 'Consultor', phone: '5547991594019' },
  acima3m: { name: 'Marcos Teodoro', phone: '5547991594019' },
}

type BudgetId = Consultant['budget_band']
type City = 'Balneário Camboriú' | 'Itapema' | 'Porto Belo' | 'Bombinhas'

const CITY_OPTIONS: City[] = [
  'Balneário Camboriú',
  'Itapema',
  'Porto Belo',
  'Bombinhas',
]

export function BrokerStrip() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [city, setCity] = useState<City | null>(null)
  const [budget, setBudget] = useState<BudgetId | null>(null)
  const [consultants, setConsultants] = useState<Consultant[]>([])

  useEffect(() => {
    void fetchConsultants(false)
      .then(setConsultants)
      .catch(() => setConsultants([]))
  }, [])

  const budgetOptions = useMemo(() => {
    if (consultants.length === 0) return BUDGET_BANDS
    return BUDGET_BANDS.filter((b) =>
      consultants.some((c) => c.budget_band === b.id && c.active),
    ).map((b) => ({
      ...b,
      label: consultants.find((c) => c.budget_band === b.id)?.budget_label || b.label,
    }))
  }, [consultants])

  const resolveBroker = (band: BudgetId) => {
    const c = consultants.find((x) => x.budget_band === band && x.active)
    if (c) return { name: c.name, phone: c.whatsapp.replace(/\D/g, '') }
    return FALLBACK_BROKERS[band]
  }

  const reset = () => {
    setStep(0)
    setCity(null)
    setBudget(null)
  }

  const close = () => {
    setOpen(false)
    reset()
  }

  const openWizard = () => {
    reset()
    setOpen(true)
  }

  useEffect(() => {
    const openFromHash = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#contato') {
        openWizard()
      }
    }
    const onCustom = () => openWizard()

    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    window.addEventListener('marcos:open-contato', onCustom)
    return () => {
      window.removeEventListener('hashchange', openFromHash)
      window.removeEventListener('marcos:open-contato', onCustom)
    }
  }, [])

  const whatsappUrl = () => {
    if (!city || !budget) return '#'
    const broker = resolveBroker(budget)
    const budgetLabel =
      budgetOptions.find((b) => b.id === budget)?.label ??
      BUDGET_BANDS.find((b) => b.id === budget)?.label ??
      ''
    const text = [
      `Olá ${broker.name}, vim pelo site do Marcos Teodoro.`,
      `Quero investir em ${city}.`,
      `Faixa de investimento: ${budgetLabel}.`,
      'Pode me ajudar?',
    ].join(' ')
    return `https://wa.me/${broker.phone}?text=${encodeURIComponent(text)}`
  }

  return (
    <section id="contato" className="bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid md:grid-cols-[200px_1fr_auto] items-center gap-5 md:gap-8">
          <div className="relative w-[160px] sm:w-[180px] md:w-full aspect-[4/5] rounded-xl overflow-hidden mx-auto md:mx-0 shadow-[0_12px_32px_rgba(11,20,32,.12)]">
            <Image
              src={MARCOS_PHOTO_2}
              alt="Marcos Teodoro"
              fill
              className="object-cover object-[center_18%]"
              sizes="(max-width: 768px) 180px, 200px"
              quality={90}
            />
          </div>

          <div className="text-center md:text-left">
            <div className="text-[0.68rem] sm:text-[0.62rem] font-semibold tracking-[.16em] uppercase text-[#0e6b7a] mb-2">
              Atendimento direto
            </div>
            <h2 className="font-serif text-[1.35rem] sm:text-[1.55rem] font-normal text-[#0b1420] mb-2 leading-tight">
              Fale com Marcos Teodoro
            </h2>
            <p className="text-[0.9rem] sm:text-[0.86rem] text-[#5a6069] max-w-[46ch] mx-auto md:mx-0 leading-relaxed">
              Escolha a cidade e o valor do investimento para ser direcionado ao consultor certo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
            <button
              type="button"
              onClick={openWizard}
              className="inline-flex items-center justify-center bg-[#0e6b7a] text-white rounded-full px-6 py-3 text-[0.72rem] sm:text-[0.68rem] font-semibold tracking-[.12em] uppercase hover:bg-[#095260] transition-colors min-h-[44px] whitespace-nowrap cursor-pointer"
            >
              Falar com Marcos
            </button>
            <a
              href="https://www.instagram.com/marcosteodoro.imoveis/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-[#d9d5ce] text-[#0b1420] rounded-full px-6 py-3 text-[0.72rem] sm:text-[0.68rem] font-semibold tracking-[.12em] uppercase hover:border-[#0e6b7a] hover:text-[#0e6b7a] transition-colors min-h-[44px] whitespace-nowrap"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-wizard-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0b1420]/45"
            aria-label="Fechar"
            onClick={close}
          />
          <div className="relative w-full sm:max-w-[440px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="text-[0.7rem] sm:text-[0.55rem] font-semibold tracking-[.14em] uppercase text-[#0e6b7a] mb-1">
                  Passo {step + 1} de 2
                </div>
                <h3 id="contact-wizard-title" className="font-serif text-[1.2rem] text-[#0b1420]">
                  {step === 0 ? 'Onde você deseja comprar?' : 'Quanto quer investir?'}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                className="w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center text-[1.35rem] leading-none rounded-full border border-[#e8e6e1] text-[#5a6069] hover:text-[#0b1420] transition-colors"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {step === 0 && (
              <div className="grid gap-2">
                {CITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setCity(opt)
                      setStep(1)
                    }}
                    className="text-left border border-[#e8e6e1] rounded-xl px-4 py-3 min-h-[48px] hover:border-[#0e6b7a] hover:bg-[#faf9f7] transition-colors text-[0.95rem] sm:text-[0.9rem] font-medium text-[#0b1420]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-2">
                {city && (
                  <p className="text-[0.78rem] text-[#6f7680] mb-1">
                    Cidade: <span className="text-[#0b1420] font-medium">{city}</span>
                  </p>
                )}
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBudget(opt.id)}
                    className={`text-left border rounded-xl px-4 py-3 min-h-[48px] transition-colors text-[0.95rem] sm:text-[0.9rem] font-medium ${
                      budget === opt.id
                        ? 'border-[#0e6b7a] bg-[#e8f4f6] text-[#0e6b7a]'
                        : 'border-[#e8e6e1] text-[#0b1420] hover:border-[#0e6b7a] hover:bg-[#faf9f7]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}

                <a
                  href={budget ? whatsappUrl() : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!budget}
                  onClick={(e) => {
                    if (!budget) e.preventDefault()
                  }}
                  className={`mt-3 inline-flex items-center justify-center rounded-full px-6 py-3 text-[0.75rem] sm:text-[0.7rem] font-semibold tracking-[.12em] uppercase min-h-[48px] transition-colors ${
                    budget
                      ? 'bg-[#0e6b7a] text-white hover:bg-[#095260]'
                      : 'bg-[#e8e6e1] text-[#9a9da2] pointer-events-none'
                  }`}
                >
                  Continuar no WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setBudget(null)
                    setStep(0)
                  }}
                  className="mt-1 py-2 text-[0.78rem] sm:text-[0.72rem] text-[#6f7680] hover:text-[#0e6b7a]"
                >
                  Voltar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
