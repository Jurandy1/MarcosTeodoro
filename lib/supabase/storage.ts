import type { StoredImage } from '@/lib/storage'

/**
 * Comprime para WebP no browser e devolve blob + dimensões.
 */
export async function compressToWebp(
  file: File,
  maxSide = 1600,
  quality = 0.82,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas indisponível')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Falha ao gerar WebP'))),
      'image/webp',
      quality,
    )
  })

  return { blob, width, height }
}

/**
 * Upload provider-agnóstico: path relativo + metadata.
 * O backend grava em `imoveis/{imovel_id}/{uuid}.webp`.
 */
export async function uploadPropertyPhotos(
  imovelId: string,
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<StoredImage[]> {
  const results: StoredImage[] = []
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file.type.startsWith('image/')) continue

    const { blob, width, height } = await compressToWebp(file)
    const body = new FormData()
    body.append('imovelId', imovelId)
    body.append('width', String(width))
    body.append('height', String(height))
    body.append('file', new File([blob], 'upload.webp', { type: 'image/webp' }))

    const res = await fetch('/api/admin/upload', { method: 'POST', body })
    const json = (await res.json()) as StoredImage & { error?: string }
    if (!res.ok || !json.path) {
      throw new Error(json.error || 'Falha no upload da foto')
    }

    results.push({
      path: json.path,
      width: json.width || width,
      height: json.height || height,
      sizeBytes: json.sizeBytes || blob.size,
      mimeType: json.mimeType || 'image/webp',
    })
    onProgress?.(i + 1, total)
  }

  return results
}

export async function removePropertyPhoto(path: string): Promise<void> {
  if (!path || !path.startsWith('imoveis/')) return
  try {
    await fetch('/api/admin/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
  } catch {
    /* best-effort */
  }
}

export async function removePropertyPhotos(paths: string[]): Promise<void> {
  const clean = paths.filter((p) => p && p.startsWith('imoveis/'))
  if (clean.length === 0) return
  try {
    await fetch('/api/admin/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: clean }),
    })
  } catch {
    /* best-effort */
  }
}
