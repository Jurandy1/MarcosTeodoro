/**
 * Storage agnóstico (Supabase hoje → Cloudflare R2 depois).
 * O banco guarda só path relativo; a URL pública é montada aqui.
 */

export type StoredImage = {
  /** Path relativo no bucket — ex: imoveis/{imovel_id}/{uuid}.webp */
  path: string
  width: number
  height: number
  sizeBytes: number
  mimeType: string
}

/** Base pública do bucket (sem barra final). Trocar só isto na migração R2. */
export function getStorageBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL ||
    process.env.VITE_STORAGE_BASE_URL ||
    ''
  return base.replace(/\/$/, '')
}

/**
 * Monta URL final a partir do path relativo.
 * Se já for URL absoluta / dataURL (legado ou demo), devolve como está.
 */
export function storageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('/')) {
    return path
  }
  const base = getStorageBaseUrl()
  if (!base) {
    // Fallback temporário para o bucket atual do Supabase
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
    if (supabase) {
      return `${supabase}/storage/v1/object/public/property-photos/${path.replace(/^\//, '')}`
    }
    return path
  }
  return `${base}/${path.replace(/^\//, '')}`
}

export function storageUrls(paths: (string | StoredImage)[] | undefined): string[] {
  if (!paths?.length) return []
  return paths.map((p) => storageUrl(typeof p === 'string' ? p : p.path))
}

/** Convenção única Supabase/R2 */
export function propertyImagePath(imovelId: string, fileName: string): string {
  const id = imovelId.replace(/[^a-zA-Z0-9_-]/g, '') || 'geral'
  return `imoveis/${id}/${fileName}`
}
