import { createClient } from '@/lib/supabase/client'

export type SiteSettings = {
  id: number
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  og_image_url: string | null
  company_name: string | null
  creci: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  instagram: string | null
  address: string | null
  topbar_text: string | null
  updated_at: string
}

export type Consultant = {
  id: string
  name: string
  whatsapp: string
  creci: string | null
  photo_url: string | null
  budget_band: 'ate1m' | 'de1a2' | 'de2a3' | 'acima3m'
  budget_label: string | null
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export const BUDGET_BANDS: { id: Consultant['budget_band']; label: string }[] = [
  { id: 'ate1m', label: 'Até 1 milhão' },
  { id: 'de1a2', label: 'De 1 a 2 milhões' },
  { id: 'de2a3', label: 'De 2 a 3 milhões' },
  { id: 'acima3m', label: 'Acima de 3 milhões' },
]

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw new Error(error.message)
  return data as SiteSettings | null
}

export async function saveSiteSettings(
  patch: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

export async function fetchConsultants(all = false): Promise<Consultant[]> {
  const supabase = createClient()
  let q = supabase.from('consultants').select('*').order('sort_order', { ascending: true })
  if (!all) q = q.eq('active', true)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as Consultant[]
}

export async function saveConsultant(
  row: Partial<Consultant> & { name: string; whatsapp: string; budget_band: Consultant['budget_band'] },
): Promise<void> {
  const supabase = createClient()
  const payload = {
    ...row,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('consultants').upsert(payload)
  if (error) throw new Error(error.message)
}

export async function deleteConsultant(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('consultants').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function setPropertyFeatured(
  id: string,
  isFeatured: boolean,
  featuredOrder = 0,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('properties')
    .update({
      is_featured: isFeatured,
      featured_order: featuredOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
