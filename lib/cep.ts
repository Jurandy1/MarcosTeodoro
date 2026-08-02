/** Consulta CEP (AwesomeAPI + fallback ViaCEP). */

export type CepResult = {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  /** Endereço montado para o formulário */
  address: string
  locationLabel: string
  lat?: number
  lng?: number
}

function onlyDigits(cep: string) {
  return cep.replace(/\D/g, '').slice(0, 8)
}

export function formatCep(cep: string): string {
  const d = onlyDigits(cep)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

export function isCompleteCep(cep: string): boolean {
  return onlyDigits(cep).length === 8
}

type AwesomeResponse = {
  cep?: string
  address?: string
  address_name?: string
  district?: string
  city?: string
  state?: string
  lat?: string
  lng?: string
  status?: number
  message?: string
}

type ViaCepResponse = {
  erro?: boolean | string
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

function buildResult(input: {
  cep: string
  street?: string
  neighborhood?: string
  city: string
  state: string
  lat?: number
  lng?: number
}): CepResult {
  const street = input.street?.trim() || ''
  const neighborhood = input.neighborhood?.trim() || ''
  const parts = [street, neighborhood, `${input.city}/${input.state}`].filter(Boolean)
  const locationLabel = neighborhood
    ? `${input.city}, ${neighborhood}`
    : input.city

  return {
    cep: formatCep(input.cep),
    street,
    neighborhood,
    city: input.city,
    state: input.state,
    address: parts.join(', '),
    locationLabel,
    lat: input.lat,
    lng: input.lng,
  }
}

async function fetchAwesome(digits: string): Promise<CepResult | null> {
  const res = await fetch(`https://cep.awesomeapi.com.br/json/${digits}`, {
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return null
  const data = (await res.json()) as AwesomeResponse
  if (!data.city || !data.state || data.status === 400) return null

  const lat = data.lat != null ? Number(data.lat) : undefined
  const lng = data.lng != null ? Number(data.lng) : undefined

  return buildResult({
    cep: digits,
    street: data.address || data.address_name,
    neighborhood: data.district,
    city: data.city,
    state: data.state,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  })
}

async function fetchViaCep(digits: string): Promise<CepResult | null> {
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return null
  const data = (await res.json()) as ViaCepResponse
  if (data.erro || !data.localidade || !data.uf) return null

  return buildResult({
    cep: digits,
    street: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf,
  })
}

export async function lookupCep(cep: string): Promise<CepResult> {
  const digits = onlyDigits(cep)
  if (digits.length !== 8) {
    throw new Error('CEP incompleto')
  }

  try {
    const primary = await fetchAwesome(digits)
    if (primary) return primary
  } catch {
    /* fallback */
  }

  try {
    const fallback = await fetchViaCep(digits)
    if (fallback) return fallback
  } catch {
    /* ignore */
  }

  throw new Error('CEP não encontrado')
}

/** Extrai CEP de um texto livre (anúncio / endereço). */
export function extractCepFromText(text: string): string | null {
  const m = text.match(/\b(\d{5})-?(\d{3})\b/)
  if (!m) return null
  return formatCep(`${m[1]}${m[2]}`)
}

/** Alinha cidade da API com as cidades do site, se possível. */
export function matchCityKey(
  city: string,
  allowed: readonly string[],
): string | undefined {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  const target = norm(city)
  return allowed.find((c) => norm(c) === target)
}
