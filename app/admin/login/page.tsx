'use client'

import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const search = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      setLoading(false)
      setError(
        'Variáveis do Supabase ausentes no deploy. No Vercel, configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY e faça Redeploy.',
      )
      return
    }

    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (err) {
        setLoading(false)
        setError(
          err.message === 'Invalid login credentials'
            ? 'E-mail ou senha inválidos.'
            : err.message,
        )
        return
      }

      // Navegação full para o middleware ler o cookie da sessão
      const next = search.get('next') || '/admin'
      window.location.assign(next)
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Falha ao conectar no Supabase.')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[400px] bg-white border border-[#ebe8e2] p-6 sm:p-8 space-y-4"
      >
        <div>
          <p className="text-[0.62rem] font-semibold tracking-[.16em] uppercase text-[#0e6b7a] mb-2">
            Painel
          </p>
          <h1 className="font-serif text-[1.6rem] text-[#0b1420]">Entrar</h1>
          <p className="mt-1 text-[0.85rem] text-[#6f7680]">
            Acesse para cadastrar imóveis, fotos e anúncios.
          </p>
        </div>

        <div>
          <label className="block text-[0.65rem] font-semibold tracking-[.1em] uppercase text-[#7a818a] mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mestreafil@gmail.com"
            className="w-full border border-[#ddd7cc] px-3 py-2.5 text-[0.95rem] outline-none focus:border-[#0e6b7a]"
          />
        </div>

        <div>
          <label className="block text-[0.65rem] font-semibold tracking-[.1em] uppercase text-[#7a818a] mb-1.5">
            Senha
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#ddd7cc] px-3 py-2.5 text-[0.95rem] outline-none focus:border-[#0e6b7a]"
          />
        </div>

        {error && (
          <p className="text-[0.85rem] text-[#9b3b3b] bg-[#fdf2f2] border border-[#f0d4d4] px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[46px] bg-[#0e6b7a] text-white text-[0.72rem] font-semibold tracking-[.1em] uppercase hover:bg-[#095260] disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[#6f7680]">Carregando…</p>}>
      <LoginForm />
    </Suspense>
  )
}
