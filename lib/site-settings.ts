import { createClient } from '@/lib/supabase/server'
import type { SiteSettings } from '@/lib/supabase/settings-api'

export type PublicSiteSettings = {
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  ogImageUrl: string
  companyName: string
  creci: string
  phone: string
  whatsapp: string
  email: string
  instagram: string
  address: string
  topbarText: string
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://marcosteodoro.com.br'

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  seoTitle: 'Marcos Teodoro | Corretor de Imóveis no Litoral de SC',
  seoDescription:
    'Especialista em investimento imobiliário no litoral Norte de Santa Catarina. Imóveis à venda e para alugar em Balneário Camboriú, Itapema e Porto Belo. CRECI SC 71914.',
  seoKeywords: [
    'corretor de imóveis',
    'Balneário Camboriú',
    'Itapema',
    'Porto Belo',
    'imóveis litoral SC',
  ],
  ogImageUrl: '/hero-litoral.jpg',
  companyName: 'Marcos Teodoro',
  creci: 'CRECI SC 71914',
  phone: '47991594019',
  whatsapp: '5547991594019',
  email: '',
  instagram: 'https://www.instagram.com/marcosteodoro.imoveis/',
  address: '',
  topbarText: 'CRECI SC 71914 | Balneário Camboriú, Itapema, Porto Belo, Bombinhas',
}

function digits(s: string) {
  return s.replace(/\D/g, '')
}

/** Normaliza WhatsApp para wa.me (com DDI 55 se faltar). */
export function normalizeWhatsapp(raw?: string | null): string {
  let d = digits(raw || '')
  if (!d) return DEFAULT_SITE_SETTINGS.whatsapp
  if (d.length <= 11) d = `55${d}`
  return d
}

export function whatsappUrl(phone: string, text?: string) {
  const base = `https://wa.me/${normalizeWhatsapp(phone)}`
  if (!text) return base
  return `${base}?text=${encodeURIComponent(text)}`
}

export function formatPhoneDisplay(phone: string) {
  const d = digits(phone)
  const local = d.startsWith('55') ? d.slice(2) : d
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 3)} ${local.slice(3, 7)} ${local.slice(7)}`
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)} ${local.slice(6)}`
  }
  return phone
}

export function instagramUrl(raw?: string | null): string {
  const v = (raw || '').trim()
  if (!v) return DEFAULT_SITE_SETTINGS.instagram
  if (v.startsWith('http')) return v
  const handle = v.replace(/^@/, '')
  return `https://www.instagram.com/${handle}/`
}

export function instagramHandle(raw?: string | null): string {
  const v = (raw || '').trim()
  if (!v) return '@marcosteodoro.imoveis'
  if (v.includes('instagram.com')) {
    const m = v.match(/instagram\.com\/([^/?#]+)/i)
    return m ? `@${m[1]}` : '@marcosteodoro.imoveis'
  }
  return v.startsWith('@') ? v : `@${v}`
}

function mapRow(row: SiteSettings | null): PublicSiteSettings {
  if (!row) return { ...DEFAULT_SITE_SETTINGS }
  const keywords = (row.seo_keywords || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
  return {
    seoTitle: row.seo_title?.trim() || DEFAULT_SITE_SETTINGS.seoTitle,
    seoDescription: row.seo_description?.trim() || DEFAULT_SITE_SETTINGS.seoDescription,
    seoKeywords: keywords.length ? keywords : DEFAULT_SITE_SETTINGS.seoKeywords,
    ogImageUrl: row.og_image_url?.trim() || DEFAULT_SITE_SETTINGS.ogImageUrl,
    companyName: row.company_name?.trim() || DEFAULT_SITE_SETTINGS.companyName,
    creci: row.creci?.trim() || DEFAULT_SITE_SETTINGS.creci,
    phone: row.phone?.trim() || DEFAULT_SITE_SETTINGS.phone,
    whatsapp: normalizeWhatsapp(row.whatsapp || row.phone),
    email: row.email?.trim() || '',
    instagram: row.instagram?.trim() || DEFAULT_SITE_SETTINGS.instagram,
    address: row.address?.trim() || '',
    topbarText: row.topbar_text?.trim() || DEFAULT_SITE_SETTINGS.topbarText,
  }
}

/** Settings públicos (anon pode ler site_settings). */
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
    if (error || !data) return { ...DEFAULT_SITE_SETTINGS }
    return mapRow(data as SiteSettings)
  } catch {
    return { ...DEFAULT_SITE_SETTINGS }
  }
}
