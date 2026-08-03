'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, startTransition } from 'react'

const navLinks = [
  { href: '/vendas?tipo=apartamento', label: 'Apartamentos a venda', match: '/vendas' },
  { href: '/vendas?tipo=casa', label: 'Casas a venda', match: '/vendas' },
  { href: '/aluguel', label: 'Aluguel', match: '/aluguel' },
  { href: '/sobre', label: 'Sobre', match: '/sobre' },
  { href: '/contato', label: 'Contato', match: '/contato' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    startTransition(() => setOpen(false))
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const closeMenu = () => {
    startTransition(() => setOpen(false))
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#e6e2da] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6 py-3 sm:py-[0.9rem]">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <div
            className="font-serif italic text-[1.15rem] w-8 h-8 sm:w-9 sm:h-9 border border-[#0e6b7a] text-[#0e6b7a] flex items-center justify-center rounded-md shrink-0"
            aria-hidden="true"
          >
            M
          </div>
          <div className="min-w-0">
            <div className="text-[0.78rem] sm:text-[0.95rem] font-bold tracking-[.12em] sm:tracking-[.22em] text-[#1a2432] leading-tight uppercase truncate">
              MARCOS <span className="text-[#0e6b7a]">TEODORO</span>
            </div>
            <div className="text-[0.62rem] sm:text-[0.62rem] text-[#6f7680] tracking-[.08em] sm:tracking-[.14em] uppercase leading-tight mt-0.5">
              Consultor imobiliário
            </div>
          </div>
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-4 lg:gap-5 list-none text-[0.65rem] lg:text-[0.7rem] font-semibold tracking-[.1em] lg:tracking-[.12em] uppercase text-[#4a5560]">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition-colors hover:text-[#0e6b7a] whitespace-nowrap ${
                    pathname.startsWith(link.match) ? 'text-[#0e6b7a]' : ''
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2da] text-[#0b1420] hover:border-[#0e6b7a] transition-colors"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-[#e6e2da] bg-white">
          <nav aria-label="Menu mobile" className="px-4 py-3">
            <ul className="flex flex-col list-none">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={`block px-3 py-3 text-[0.8rem] font-semibold tracking-[.1em] uppercase ${
                      pathname.startsWith(link.match) ? 'text-[#0e6b7a]' : 'text-[#4a5560]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  )
}
