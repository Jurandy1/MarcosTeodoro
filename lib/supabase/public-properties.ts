import { createClient } from '@/lib/supabase/server'
import { fromRow, type PropertyImageRow, type PropertyRow } from '@/lib/supabase/properties-map'
import type { CatalogProperty, PropertyMode } from '@/lib/properties'

async function fetchImageMap(ids: string[]): Promise<Record<string, PropertyImageRow[]>> {
  if (ids.length === 0) return {}
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .in('property_id', ids)
    .order('sort_order', { ascending: true })
  if (error) return {}
  const map: Record<string, PropertyImageRow[]> = {}
  for (const row of (data ?? []) as PropertyImageRow[]) {
    ;(map[row.property_id] ??= []).push(row)
  }
  return map
}

/** Imóveis públicos (status pronto) a partir do Supabase. */
export async function fetchPublicProperties(mode?: PropertyMode): Promise<CatalogProperty[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from('properties').select('*').eq('status', 'pronto')
    if (mode) query = query.eq('mode', mode)
    const { data, error } = await query.order('updated_at', { ascending: false })
    if (error || !data) return []
    const rows = data as PropertyRow[]
    const imagesMap = await fetchImageMap(rows.map((r) => r.id))
    const seen = new Set<string>()
    return rows
      .map((r) => fromRow(r, imagesMap[r.id] ?? []))
      .filter((p) => {
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
  } catch {
    return []
  }
}

export async function fetchPublicProperty(id: string): Promise<CatalogProperty | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('status', 'pronto')
      .maybeSingle()
    if (error || !data) return null
    const imagesMap = await fetchImageMap([id])
    return fromRow(data as PropertyRow, imagesMap[id] ?? [])
  } catch {
    return null
  }
}
