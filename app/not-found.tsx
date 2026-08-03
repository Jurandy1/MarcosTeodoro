import Link from 'next/link'
import { Topbar } from '@/components/topbar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function NotFound() {
  return (
    <>
      <Topbar />
      <SiteHeader />
      <main className="bg-[#f7f5f1] min-h-[50vh]">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-[0.68rem] font-semibold tracking-[.16em] uppercase text-[#0e6b7a] mb-3">
            404
          </p>
          <h1 className="font-serif text-[2rem] sm:text-[2.4rem] text-[#0b1420] leading-tight mb-3">
            Página não encontrada
          </h1>
          <p className="text-[0.95rem] text-[#6f7680] mb-8">
            O link pode ter mudado ou o imóvel não está mais publicado.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/vendas"
              className="inline-flex min-h-[44px] items-center px-5 bg-[#0b1420] text-white text-[0.68rem] font-semibold tracking-[.1em] uppercase"
            >
              Ver imóveis à venda
            </Link>
            <Link
              href="/contato"
              className="inline-flex min-h-[44px] items-center px-5 border border-[#0e6b7a] text-[#0e6b7a] text-[0.68rem] font-semibold tracking-[.1em] uppercase"
            >
              Contato
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center px-5 text-[#6f7680] text-[0.68rem] font-semibold tracking-[.1em] uppercase"
            >
              Início
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
