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
  empreendimento?: string | null
  unidade?: string | null
  error?: string
  dryRun?: boolean
  totalFotos?: number
  done?: boolean
  nextOffset?: number
  batch_fotos?: number
  duplicate?: boolean
  existingId?: string
  existingTitle?: string
}

export class DwvDuplicateError extends Error {
  existingId: string
  existingTitle?: string
  constructor(message: string, existingId: string, existingTitle?: string) {
    super(message)
    this.name = 'DwvDuplicateError'
    this.existingId = existingId
    this.existingTitle = existingTitle
  }
}

async function postImport(body: Record<string, unknown>): Promise<ImportDwvResult> {
  const res = await fetch('/api/admin/import-dwv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let json: ImportDwvResult
  try {
    json = JSON.parse(text) as ImportDwvResult
  } catch {
    const hint = text.slice(0, 120).replace(/\s+/g, ' ')
    throw new Error(
      res.status === 504 || /timeout|FUNCTION_INVOCATION/i.test(text)
        ? 'Timeout no servidor ao importar fotos. Tente de novo (importação em lotes).'
        : `Resposta inválida do servidor (${res.status}): ${hint || 'vazia'}`,
    )
  }

  if (json.duplicate && json.existingId) {
    throw new DwvDuplicateError(
      json.error || 'Imóvel já cadastrado com este link DWV.',
      json.existingId,
      json.existingTitle,
    )
  }

  if (!res.ok || json.error) {
    throw new Error(json.error || `Falha no import DWV (${res.status})`)
  }
  return json
}

/**
 * Importa galeria DWV em lotes (3 fotos/req) — evita timeout do Vercel.
 */
export async function importDwvGallery(opts: {
  galleryUrl: string
  propertyId: string
  replacePhotos?: boolean
  dryRun?: boolean
  onProgress?: (done: number, total: number) => void
}): Promise<ImportDwvResult> {
  if (opts.dryRun) {
    return postImport({
      gallery_url: opts.galleryUrl,
      propertyId: opts.propertyId,
      dryRun: true,
    })
  }

  const allImages: StoredImage[] = []
  let falhas = 0
  const errors: string[] = []
  let offset = 0
  let propertyId = opts.propertyId
  let title: string | undefined
  let empreendimento: string | null | undefined
  let unidade: string | null | undefined
  let totalFotos = 0
  let coverPath: string | null = null
  let replacePhotos = opts.replacePhotos ?? true

  for (;;) {
    const batch = await postImport({
      gallery_url: opts.galleryUrl,
      propertyId,
      replacePhotos,
      offset,
      limit: 3,
    })

    replacePhotos = false
    propertyId = batch.propertyId || propertyId
    title = batch.title || title
    empreendimento = batch.empreendimento ?? empreendimento
    unidade = batch.unidade ?? unidade
    totalFotos = batch.totalFotos || totalFotos
    if (batch.coverPath && !coverPath) coverPath = batch.coverPath
    if (batch.images?.length) allImages.push(...batch.images)
    falhas += batch.falhas ?? 0
    if (batch.errors?.length) errors.push(...batch.errors)

    offset = batch.nextOffset ?? offset + (batch.images?.length ?? 0)
    opts.onProgress?.(Math.min(offset, totalFotos || offset), totalFotos || offset)

    if (batch.done || offset >= (totalFotos || Infinity)) break
    if ((batch.batch_fotos ?? 0) === 0 && (batch.falhas ?? 0) > 0 && offset === 0) {
      break
    }
  }

  return {
    ok: true,
    propertyId,
    title,
    empreendimento,
    unidade,
    totalFotos,
    total_fotos: allImages.length,
    falhas,
    errors: errors.slice(0, 5),
    coverPath,
    images: allImages,
    done: true,
  }
}
