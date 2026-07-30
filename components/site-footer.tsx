import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[#0b1420] text-[#a9abaf] text-[0.78rem]">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 py-12">
        {/* Coluna 1: identidade */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-8 h-8 border border-[#c9a35a] text-[#c9a35a] flex items-center justify-center rounded-md shrink-0"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.1rem' }}
              aria-hidden="true"
            >
              M
            </div>
            <div className="text-[0.95rem] font-bold tracking-[.22em] text-white uppercase">
              MARCOS <span className="text-[#c9a35a]">TEODORO</span>
            </div>
          </div>
          <p className="text-[0.8rem] leading-relaxed text-[#8b8f96] mb-4 max-w-[28ch]">
            Especialista em investimento imobiliário no litoral Norte de Santa Catarina.
          </p>
          <p className="text-[0.68rem] tracking-[.1em] text-[#5a6069]">CRECI/SC 71914</p>
        </div>

        {/* Coluna 2: links rápidos */}
        <div>
          <h4 className="text-[0.62rem] font-bold tracking-[.28em] uppercase text-white mb-4">
            Navegação
          </h4>
          <ul className="space-y-2.5">
            {[
              { href: '/', label: 'Início' },
              { href: '/vendas', label: 'Imóveis à Venda' },
              { href: '/aluguel', label: 'Imóveis para Alugar' },
              { href: '/#sobre', label: 'Sobre Marcos' },
              { href: '/#contato', label: 'Contato' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#c9a35a] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 3: contato */}
        <div>
          <h4 className="text-[0.62rem] font-bold tracking-[.28em] uppercase text-white mb-4">
            Contato
          </h4>
          <ul className="space-y-2.5">
            <li>
              <a
                href="https://wa.me/5547991594019"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#c9a35a] transition-colors"
              >
                (47) 9 9159-4019
              </a>
            </li>
            <li className="pt-1">
              <a
                href="https://www.instagram.com/marcosteodoro.imoveis/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#c9a35a] transition-colors"
              >
                @marcosteodoro.imoveis
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.08] text-center py-5 text-[0.65rem] text-[#5a6069] tracking-[.06em]">
        &copy; {new Date().getFullYear()} Marcos Teodoro. Todos os direitos reservados.
      </div>

      {/* WhatsApp flutuante */}
      <a
        href="https://wa.me/5547991594019?text=Olá%2C%20tenho%20interesse%20em%20imóveis%20no%20litoral."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale pelo WhatsApp"
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-[#25d366] flex items-center justify-center shadow-[0_10px_28px_rgba(0,0,0,.3)] z-50 hover:scale-110 transition-transform"
        style={{ animation: 'floatY 4s ease-in-out infinite' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
        </svg>
      </a>
    </footer>
  )
}
