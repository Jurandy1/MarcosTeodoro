'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/#sobre', label: 'Sobre' },
  { href: '/vendas', label: 'Vendas' },
  { href: '/aluguel', label: 'Aluguel' },
  { href: '/#contato', label: 'Contato' },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#e6e2da] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between gap-6 py-[0.9rem]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-9 h-9 border border-[#0e6b7a] text-[#0e6b7a] flex items-center justify-center rounded-md"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.2rem' }}
            aria-hidden="true"
          >
            M
          </div>
          <div>
            <div className="text-[0.95rem] font-bold tracking-[.22em] text-[#1a2432] leading-tight uppercase">
              MARCOS <span className="text-[#0e6b7a]">TEODORO</span>
            </div>
            <div className="text-[0.62rem] text-[#6f7680] tracking-[.14em] uppercase leading-tight mt-0.5">
              Corretor de Imóveis · SC
            </div>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav aria-label="Navegação principal">
          <ul className="hidden md:flex items-center gap-6 list-none text-[0.72rem] font-semibold tracking-[.14em] uppercase text-[#4a5560]">
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
                Anuncie seu imóvel
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile: só botão de CTA */}
        <div className="flex md:hidden">
          <Link
            href="/#contato"
            className="bg-[#0e6b7a] text-white rounded-full px-4 py-2 text-[0.65rem] font-semibold tracking-[.12em] uppercase transition-all hover:bg-[#095260]"
          >
            Contato
          </Link>
        </div>
      </div>
    </header>
  )
}
