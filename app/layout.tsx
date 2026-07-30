import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Montserrat, Fraunces } from 'next/font/google'
import './globals.css'

const _montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const _fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['opsz'],
})

export const metadata: Metadata = {
  title: 'Marcos Teodoro — Corretor de Imóveis no Litoral de SC',
  description:
    'Especialista em investimento imobiliário no litoral Norte de Santa Catarina. Imóveis à venda e para alugar em Balneário Camboriú, Itapema e Porto Belo. CRECI/SC 71914.',
  keywords: ['corretor de imóveis', 'Balneário Camboriú', 'Itapema', 'Porto Belo', 'imóveis litoral SC'],
  openGraph: {
    title: 'Marcos Teodoro — Corretor de Imóveis',
    description: 'Especialista em investimento imobiliário no litoral Norte de SC.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
  themeColor: '#0b1420',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${_montserrat.variable} ${_fraunces.variable} bg-background`}>
      <body className="antialiased font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
