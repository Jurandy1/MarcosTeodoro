import { NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * Proxy Nominatim — identifica endereço a partir de texto livre.
 * Uso: /api/geocode?q=Rua+234+478,+Itapema/SC
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 3) {
    return NextResponse.json({ error: 'Informe o endereço' }, { status: 400 })
  }

  try {
    const queries = buildQueryVariants(q)
    let results: unknown[] = []

    for (const query of queries) {
      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.set('q', query)
      url.searchParams.set('format', 'json')
      url.searchParams.set('addressdetails', '1')
      url.searchParams.set('limit', '5')
      url.searchParams.set('countrycodes', 'br')

      const res = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MarcosTeodoroImoveis/1.0 (admin cadastro)',
        },
        next: { revalidate: 86400 },
      })

      if (!res.ok) continue
      const json = await res.json()
      if (Array.isArray(json) && json.length > 0) {
        results = json
        break
      }
    }

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'Falha na busca de endereço' }, { status: 502 })
  }
}

function buildQueryVariants(raw: string): string[] {
  const base = raw.trim()
  const withCountry = /brasil|brazil/i.test(base) ? base : `${base}, Brasil`
  const variants = [withCountry]

  // "Rua 234 478, Itapema/SC" → "Rua 234, nº 478, Itapema, SC, Brasil"
  const spacedNumber = base.match(
    /^((?:Rua|Av\.?|Avenida|Rodovia|Travessa|Alameda)\s+\d+)\s+(\d+)\s*,\s*(.+)$/i,
  )
  if (spacedNumber) {
    const city = spacedNumber[3].replace('/', ', ')
    variants.unshift(
      `${spacedNumber[1]}, ${spacedNumber[2]}, ${city}, Santa Catarina, Brasil`,
      `${spacedNumber[1]}, ${city}, Santa Catarina, Brasil`,
    )
  }

  // Garante variante só com cidade
  const cityOnly = base.match(
    /(Balneário Camboriú|Itapema|Porto Belo|Bombinhas|Itajaí)\s*(?:\/\s*SC)?/i,
  )
  if (cityOnly) {
    variants.push(`${cityOnly[1]}, Santa Catarina, Brasil`)
  }

  return Array.from(new Set(variants))
}
