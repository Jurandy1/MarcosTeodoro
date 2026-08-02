'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOutAdmin } from '@/lib/supabase/properties-api'

const NAV = [
  { href: '/admin', label: 'Painel', exact: true },
  { href: '/admin/imoveis', label: 'Imóveis' },
  { href: '/admin/destaques', label: 'Destaques' },
  { href: '/admin/consultores', label: 'Consultores' },
  { href: '/admin/contatos', label: 'Contatos' },
  { href: '/admin/seo', label: 'SEO' },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return <main className="min-h-screen flex items-center justify-center px-4 py-10">{children}</main>
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`px-3 py-2.5 text-[0.78rem] font-semibold tracking-[.04em] transition-colors ${
              active
                ? 'bg-[#0e6b7a] text-white'
                : 'text-white/65 hover:bg-white/8 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
      <div className="my-3 border-t border-white/10" />
      <Link
        href="/admin/imoveis/novo"
        onClick={onNavigate}
        className="px-3 py-2.5 text-[0.72rem] font-semibold tracking-[.1em] uppercase bg-[#c9a35a]/15 text-[#c9a35a] hover:bg-[#c9a35a]/25"
      >
        + Novo imóvel
      </Link>
      <Link
        href="/"
        target="_blank"
        onClick={onNavigate}
        className="px-3 py-2.5 text-[0.78rem] text-white/45 hover:text-white"
      >
        Ver site ↗
      </Link>
      <button
        type="button"
        onClick={async () => {
          await signOutAdmin()
          router.replace('/admin/login')
          router.refresh()
        }}
        className="px-3 py-2.5 text-left text-[0.78rem] text-white/45 hover:text-white"
      >
        Sair
      </button>
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#eceae4] text-[#0b1420] lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col bg-[#0b1420] text-white min-h-screen sticky top-0">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-serif text-[1.15rem] leading-tight">Marcos Teodoro</p>
          <p className="mt-1 text-[0.58rem] font-semibold tracking-[.16em] uppercase text-[#c9a35a]">
            Painel administrativo
          </p>
        </div>
        <div className="py-4 flex-1">
          <NavLinks />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0b1420] text-white">
        <div className="h-14 px-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-serif text-[1rem] truncate">Marcos Teodoro</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.1em] uppercase border border-white/20"
          >
            {open ? 'Fechar' : 'Menu'}
          </button>
        </div>
        {open && (
          <div className="border-t border-white/10 pb-4 pt-2">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
