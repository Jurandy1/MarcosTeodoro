/** Geocodifica endereço livre (ex.: "Rua 234 478, Itapema/SC") via API interna. */

export type GeocodeResult = {
  displayName: string
  address: string
  city: string
  state?: string
  neighborhood?: string
  cep?: string
  lat: number
  lng: number
}

type NominatimItem = {
  display_name?: string
  lat?: string
  lon?: string
  address?: {
    road?: string
    pedestrian?: string
    house_number?: string
    suburb?: string
    neighbourhood?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
    postcode?: string
  }
}

function buildAddress(item: NominatimItem): {
  address: string
  city: string
  neighborhood?: string
  state?: string
  cep?: string
} {
  const a = item.address ?? {}
  const city = a.city || a.town || a.village || a.municipality || ''
  const road = a.road || a.pedestrian || ''
  const neighborhood = a.suburb || a.neighbourhood || undefined
  const number = a.house_number || ''
  const state = a.state?.replace(/^State of /i, '') || undefined
  const street = [road, number].filter(Boolean).join(', ')
  const parts = [
    street,
    neighborhood,
    city && state ? `${city}/${state.length <= 3 ? state : state}` : city,
  ].filter(Boolean)

  return {
    address: parts.join(', ') || item.display_name || '',
    city,
    neighborhood,
    state,
    cep: a.postcode,
  }
}

/** Chama a rota /api/geocode (proxy Nominatim). */
export async function geocodeAddress(query: string): Promise<GeocodeResult> {
  const q = query.trim()
  if (q.length < 5) throw new Error('Endereço muito curto')

  const url = `/api/geocode?q=${encodeURIComponent(q)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error('Falha ao buscar endereço')

  const data = (await res.json()) as { results?: NominatimItem[]; error?: string }
  if (data.error) throw new Error(data.error)
  const first = data.results?.[0]
  if (!first?.lat || !first?.lon) throw new Error('Endereço não encontrado')

  const built = buildAddress(first)
  const lat = Number(first.lat)
  const lng = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Coordenadas inválidas')
  }

  return {
    displayName: first.display_name || built.address,
    address: built.address,
    city: built.city,
    state: built.state,
    neighborhood: built.neighborhood,
    cep: built.cep,
    lat,
    lng,
  }
}
