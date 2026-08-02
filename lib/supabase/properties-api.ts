import type { AdminProperty } from '@/lib/admin-store'
import { createClient } from '@/lib/supabase/client'
import {
  fromRow,
  toRow,
  type PropertyImageRow,
  type PropertyRow,
} from '@/lib/supabase/properties-map'

async function fetchImagesFor(ids: string[]): Promise<Record<string, PropertyImageRow[]>> {
  if (ids.length === 0) return {}
  const supabase = createClient()
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .in('property_id', ids)
    .order('sort_order', { ascending: true })

  if (error) {
    // Tabela ainda não criada — segue sem metadata
    return {}
  }

  const map: Record<string, PropertyImageRow[]> = {}
  for (const row of (data ?? []) as PropertyImageRow[]) {
    ;(map[row.property_id] ??= []).push(row)
  }
  return map
}

export async function fetchAdminProperties(): Promise<AdminProperty[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  const rows = (data ?? []) as PropertyRow[]
  const imagesMap = await fetchImagesFor(rows.map((r) => r.id))
  return rows.map((r) => fromRow(r, imagesMap[r.id] ?? []))
}

export async function fetchAdminProperty(id: string): Promise<AdminProperty | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const imagesMap = await fetchImagesFor([id])
  return fromRow(data as PropertyRow, imagesMap[id] ?? [])
}

export async function deleteAdminPropertyDb(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function saveAdminPropertyDb(property: AdminProperty): Promise<void> {
  const supabase = createClient()
  const assets = property.imageAssets ?? []
  const payload = {
    ...toRow({
      ...property,
      coverPath: property.coverPath || assets[0]?.path,
      imageAssets: assets,
    }),
    // Limpa legado: não persistir URL completa
    cover_url: null,
    images: [],
  }

  const { error } = await supabase.from('properties').upsert(payload, { onConflict: 'id' })
  if (error) throw new Error(error.message)

  // Substitui fotos do imóvel (paths + metadata)
  await supabase.from('property_images').delete().eq('property_id', property.id)
  if (assets.length > 0) {
    const rows = assets.map((img, i) => ({
      property_id: property.id,
      path: img.path,
      width: img.width,
      height: img.height,
      size_bytes: img.sizeBytes,
      mime_type: img.mimeType,
      sort_order: i,
    }))
    const { error: imgErr } = await supabase.from('property_images').insert(rows)
    if (imgErr) throw new Error(imgErr.message)
  }

  const emp = property.empreendimento || property.unitName || property.title
  if (emp) {
    await supabase.from('catalog_empreendimentos').upsert({ name: emp }, { onConflict: 'name' })
    if (property.unidade) {
      await supabase.from('catalog_unidades').upsert(
        { empreendimento: emp, unidade: property.unidade },
        { onConflict: 'empreendimento,unidade' },
      )
    }
  }
}

export async function fetchEmpreendimentosDb(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('catalog_empreendimentos')
    .select('name')
    .order('name')
  if (error) return []
  return (data ?? []).map((r) => r.name as string)
}

export async function fetchUnidadesDb(empreendimento: string): Promise<string[]> {
  if (!empreendimento) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('catalog_unidades')
    .select('unidade')
    .eq('empreendimento', empreendimento)
    .order('unidade')
  if (error) return []
  return (data ?? []).map((r) => r.unidade as string)
}

export async function signOutAdmin() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
