/**
 * Interpreta o texto colado do WhatsApp / DWV e preenche o formulário.
 * Exemplo esperado:
 *
 * *Unidade: Emerald Bay Residece*
 * *Área privativa*: 177 m²
 * 4 dormitórios, 5 banheiros, 4 suítes, 3 vagas de garagem
 * *Valor*: R$ 3.319.843,24
 * Entrada - 30%: R$ ...
 * Reforço - 30%: 6 x R$ ...
 * Parcelamento - 40%: 72 x R$ ...
 * *Descrição unidade*: - item ...
 * *Descrição do empreendimento*: - item ...
 * Rua 234 478, Itapema/SC
 * https://lp.dwvapp.com.br/...
 */

export interface ParsedListing {
  /** Nome do empreendimento (prédio / condomínio) */
  empreendimento?: string
  /** Unidade (apto / torre) */
  unidade?: string
  unitName?: string
  title?: string
  areaPrivate?: number
  areaTotal?: number
  bedrooms?: number
  bathrooms?: number
  suites?: number
  parking?: number
  price?: string
  priceValue?: number
  entrada?: string
  reforco?: string
  parcelamento?: string
  unitFeatures?: string[]
  amenities?: string[]
  address?: string
  city?: string
  cityKey?: string
  location?: string
  cep?: string
  sourceUrl?: string
  kind?: 'apartamento' | 'casa'
  mode?: 'venda' | 'aluguel'
}

function cleanStars(s: string) {
  return s.replace(/\*+/g, '').trim()
}

function parseMoney(raw: string): { formatted: string; value: number } | null {
  const m = raw.match(/R\$\s*([\d.]+,\d{2}|\d[\d.]*)/i)
  if (!m) return null
  const numPart = m[1]
  const value = Number(numPart.replace(/\./g, '').replace(',', '.'))
  if (Number.isNaN(value)) return null
  const formatted = `R$ ${numPart.includes(',') ? numPart : numPart + ',00'}`
  return { formatted: `R$\u00a0${numPart.includes(',') ? numPart : `${numPart},00`}`, value }
}

function extractBullets(block: string): string[] {
  return block
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s*•\-–—]+/, '').trim())
    .filter((l) => l.length > 1 && !/^descrição/i.test(l))
}

function detectCity(address: string): { cityKey?: string; city?: string } {
  const m = address.match(
    /,\s*(Balneário Camboriú|Itapema|Porto Belo|Bombinhas|Itajaí)\s*(?:\/\s*SC)?/i,
  )
  if (!m) {
    const alone = address.match(
      /^(Balneário Camboriú|Itapema|Porto Belo|Bombinhas|Itajaí)\s*(?:\/\s*SC)?$/i,
    )
    if (!alone) return {}
    const name = alone[1]
    return { cityKey: name, city: `${name}` }
  }
  const name = m[1]
  return { cityKey: name, city: name }
}

export function parseListingPaste(text: string): ParsedListing {
  const raw = text.replace(/\u00a0/g, ' ').trim()
  if (!raw) return {}

  const result: ParsedListing = {
    kind: /casa\b/i.test(raw) && !/apartamento|unidade/i.test(raw) ? 'casa' : 'apartamento',
    mode: /aluguel|loca[cç][aã]o/i.test(raw) ? 'aluguel' : 'venda',
  }

  const empLabel = raw.match(/\*?Empreendimento\s*:\s*([^*\n]+)\*?/i)
  const unitLabel = raw.match(/\*?Unidade\s*:\s*([^*\n]+)\*?/i)

  if (empLabel) {
    result.empreendimento = cleanStars(empLabel[1])
  }

  if (unitLabel) {
    const name = cleanStars(unitLabel[1])
    // No DWV, "Unidade:" muitas vezes traz o nome do prédio.
    // Se parece apto/torre, vai em unidade; senão, empreendimento.
    const looksLikeUnit =
      /\b(apto|apartamento|unidade|torre|bloco|sala|cobertura)\b|\d{2,}/i.test(name) &&
      name.length < 40
    if (looksLikeUnit && result.empreendimento) {
      result.unidade = name
    } else if (looksLikeUnit && !result.empreendimento) {
      result.unidade = name
    } else {
      result.empreendimento = result.empreendimento || name
    }
  }

  if (result.empreendimento) {
    result.unitName = result.empreendimento
    result.title = result.empreendimento
  }

  const areaPriv = raw.match(/\*?Área\s+privativa\*?\s*:?\s*([\d.,]+)\s*m/i)
  if (areaPriv) {
    result.areaPrivate = Number(areaPriv[1].replace(/\./g, '').replace(',', '.'))
  }

  const areaTot = raw.match(/\*?Área\s+total\*?\s*:?\s*([\d.,]+)\s*m/i)
  if (areaTot) {
    result.areaTotal = Number(areaTot[1].replace(/\./g, '').replace(',', '.'))
  }

  const specs = raw.match(
    /(\d+)\s*dormit[oó]rios?\s*,?\s*(\d+)\s*banheiros?\s*,?\s*(\d+)\s*su[ií]tes?\s*,?\s*(\d+)\s*vagas?/i,
  )
  if (specs) {
    result.bedrooms = Number(specs[1])
    result.bathrooms = Number(specs[2])
    result.suites = Number(specs[3])
    result.parking = Number(specs[4])
  } else {
    const bed = raw.match(/(\d+)\s*dormit/i)
    const bath = raw.match(/(\d+)\s*banheiro/i)
    const suite = raw.match(/(\d+)\s*su[ií]te/i)
    const park = raw.match(/(\d+)\s*vaga/i)
    if (bed) result.bedrooms = Number(bed[1])
    if (bath) result.bathrooms = Number(bath[1])
    if (suite) result.suites = Number(suite[1])
    if (park) result.parking = Number(park[1])
  }

  const valorLine = raw.match(/\*?Valor\*?\s*:?\s*(R\$\s*[\d.\s]+,\d{2})/i)
  if (valorLine) {
    const money = parseMoney(valorLine[1])
    if (money) {
      result.price = money.formatted
      result.priceValue = money.value
    }
  }

  const entrada = raw.match(/Entrada[^\n:]*:?\s*(R\$\s*[\d.\s]+,\d{2}|[^\n]+)/i)
  if (entrada) {
    const line = entrada[1].trim()
    const money = parseMoney(line)
    result.entrada = money ? money.formatted : line
  }

  const reforco = raw.match(/Refor[cç]o[^\n:]*:?\s*([^\n]+)/i)
  if (reforco) {
    result.reforco = reforco[1].trim()
  }

  const parcelas = raw.match(/Parcelamento[^\n:]*:?\s*([^\n]+)/i)
  if (parcelas) {
    result.parcelamento = parcelas[1].trim()
  }

  const unitBlock = raw.match(
    /\*?Descri[cç][aã]o\s+(?:da\s+)?unidade\*?\s*:?\s*([\s\S]*?)(?=\*?Descri[cç][aã]o\s+(?:do\s+)?empreendimento|\nRua\b|\nAv(?:enida)?\b|https?:\/\/|$)/i,
  )
  if (unitBlock) {
    result.unitFeatures = extractBullets(unitBlock[1])
  }

  const empBlock = raw.match(
    /\*?Descri[cç][aã]o\s+(?:do\s+)?empreendimento\*?\s*:?\s*([\s\S]*?)(?=\nRua\b|\nAv(?:enida)?\b|Atenciosamente|https?:\/\/|$)/i,
  )
  if (empBlock) {
    result.amenities = extractBullets(empBlock[1])
  }

  const address =
    raw.match(
      /((?:Rua|Av\.?|Avenida|Rodovia|Travessa|Alameda)[^\n]+(?:,\s*[^\n]+)?)/i,
    ) || raw.match(/([^\n]+\/\s*SC)\s*(?:\n|$)/i)
  if (address) {
    const addr = address[1].replace(/Atenciosamente.*/i, '').trim()
    result.address = addr
    const city = detectCity(addr)
    result.cityKey = city.cityKey
    result.city = city.city ?? city.cityKey
    result.location = city.cityKey ? `${city.cityKey}` : addr
  }

  const cepMatch = raw.match(/\b(\d{5})-?(\d{3})\b/)
  if (cepMatch) {
    result.cep = `${cepMatch[1]}-${cepMatch[2]}`
  }

  const url = raw.match(/https?:\/\/[^\s)]+/i)
  if (url) {
    result.sourceUrl = url[0]
  }

  return result
}

export function slugifyId(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}
