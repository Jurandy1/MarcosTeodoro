'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navLinks = [
  { href: '/#sobre', label: 'Sobre' },
  { href: '/vendas', label: 'Vendas' },
  { href: '/aluguel', label: 'Aluguel' },
  { href: '/#contato', label: 'Contato' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#e6e2da] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between gap-3 sm:gap-6 py-3 sm:py-[0.9rem]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 border border-[#0e6b7a] text-[#0e6b7a] flex items-center justify-center rounded-md shrink-0"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.15rem' }}
            aria-hidden="true"
          >
            M
          </div>
          <div className="min-w-0">
            <div className="text-[0.78rem] sm:text-[0.95rem] font-bold tracking-[.12em] sm:tracking-[.22em] text-[#1a2432] leading-tight uppercase truncate">
              MARCOS <span className="text-[#0e6b7a]">TEODORO</span>
            </div>
            <div className="text-[0.55rem] sm:text-[0.62rem] text-[#6f7680] tracking-[.08em] sm:tracking-[.14em] uppercase leading-tight mt-0.5">
              Corretor no litoral
            </div>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-6 list-none text-[0.72rem] font-semibold tracking-[.14em] uppercase text-[#4a5560]">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition-colors hover:text-[#0e6b7a] ${
                    pathname === link.href ? 'text-[#0e6b7a]' : ''
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#contato"
                className="bg-[#0e6b7a] text-white rounded-full px-5 py-2 text-[0.68rem] font-semibold tracking-[.14em] uppercase transition-all hover:bg-[#095260] hover:-translate-y-px"
              >
                Anunciar
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile controls */}
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

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-[#e6e2da] bg-white">
          <nav aria-label="Menu mobile" className="px-4 py-4">
            <ul className="flex flex-col gap-1 list-none">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3.5 text-[0.8rem] font-semibold tracking-[.12em] uppercase transition-colors min-h-[44px] ${
                      pathname === link.href
                        ? 'bg-[#e8f4f6] text-[#0e6b7a]'
                        : 'text-[#4a5560] hover:bg-[#f4f2ee] hover:text-[#0e6b7a]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/#contato"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center bg-[#0e6b7a] text-white rounded-full px-5 py-3.5 text-[0.72rem] font-semibold tracking-[.14em] uppercase min-h-[48px]"
            >
              Anunciar
            </Link>
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
