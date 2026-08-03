'use client'

import { useState } from 'react'

export function SharePropertyButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, url, text: title })
        return
      }
    } catch {
      /* user cancelled or unsupported */
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link do imóvel:', url)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="w-full min-h-[40px] border border-[#e5e7eb] text-[11px] font-semibold tracking-[0.1em] uppercase text-[#4a5560] hover:border-[#0e6b7a] hover:text-[#0e6b7a] transition"
    >
      {copied ? 'Link copiado' : 'Compartilhar / copiar link'}
    </button>
  )
}
