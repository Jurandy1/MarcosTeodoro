import type { StoredImage } from '@/lib/storage'

export type ImportDwvResult = {
  ok: boolean
  propertyId?: string
  total_fotos?: number
  falhas?: number
  errors?: string[]
  coverPath?: string | null
  images?: StoredImage[]
  title?: string
  error?: string
  dryRun?: boolean
  totalFotos?: number
}

/** Chama POST /api/admin/import-dwv — baixa fotos DWV → nosso bucket (paths relativos). */
export async function importDwvGallery(opts: {
  galleryUrl: string
  propertyId: string
  replacePhotos?: boolean
  dryRun?: boolean
}): Promise<ImportDwvResult> {
  const res = await fetch('/api/admin/import-dwv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gallery_url: opts.galleryUrl,
      propertyId: opts.propertyId,
      replacePhotos: opts.replacePhotos ?? true,
      dryRun: opts.dryRun ?? false,
    }),
  })
  const json = (await res.json()) as ImportDwvResult
  if (!res.ok || json.error) {
    throw new Error(json.error || `Falha no import DWV (${res.status})`)
  }
  return json
}
