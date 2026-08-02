import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { propertyImagePath, type StoredImage } from '@/lib/storage'
import {
  collectDwvPicturePaths,
  dwvDisplayTitle,
  dwvPictureUrl,
  extractTrackedLinkId,
  fetchTrackedLink,
} from '@/lib/dwv'

export const runtime = 'nodejs'
export const maxDuration = 60

const BATCH_DEFAULT = 3

async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    },
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY (ou URL) no Vercel — configure e faça Redeploy',
    )
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const cdnUrl = url
    .replace('https://dwvimages.s3.amazonaws.com/', 'https://dwvimagesv1.b-cdn.net/')
    .replace('http://dwvimages.s3.amazonaws.com/', 'https://dwvimagesv1.b-cdn.net/')

  const attempts = [cdnUrl, url].filter((u, i, arr) => arr.indexOf(u) === i)
  let lastStatus = 0
  for (const attempt of attempts) {
    const res = await fetch(attempt, {
      headers: {
        Referer: 'https://lp.dwvapp.com.br/',
        'User-Agent': 'Mozilla/5.0 (compatible; MarcosTeodoroBot/1.0)',
        Accept: 'image/*,*/*',
      },
    })
    lastStatus = res.status
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.byteLength > 0) return buf
    }
  }
  throw new Error(`Falha ao baixar foto (${lastStatus})`)
}

async function downloadAsWebp(url: string): Promise<{
  buffer: Buffer
  width: number
  height: number
  mimeType: string
  ext: string
}> {
  const input = await fetchImageBuffer(url)

  try {
    const sharp = (await import('sharp')).default
    const { data, info } = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize({
        width: 1400,
        height: 1400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true })

    return {
      buffer: data,
      width: info.width || 0,
      height: info.height || 0,
      mimeType: 'image/webp',
      ext: 'webp',
    }
  } catch {
    // Fallback sem sharp (Vercel / imagem problemática): grava JPEG/PNG original
    const isJpeg = input[0] === 0xff && input[1] === 0xd8
    const isPng = input[0] === 0x89 && input[1] === 0x50
    return {
      buffer: input,
      width: 0,
      height: 0,
      mimeType: isPng ? 'image/png' : isJpeg ? 'image/jpeg' : 'application/octet-stream',
      ext: isPng ? 'png' : 'jpg',
    }
  }
}

/**
 * POST /api/admin/import-dwv
 * Importa em lotes (evita timeout no Vercel).
 * Body: {
 *   gallery_url, propertyId?, dryRun?, replacePhotos?,
 *   offset?: number, limit?: number
 * }
 */
export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      gallery_url?: string
      propertyId?: string
      dryRun?: boolean
      replacePhotos?: boolean
      offset?: number
      limit?: number
    }

    const galleryUrl = String(body.gallery_url || '').trim()
    const trackedLinkId = extractTrackedLinkId(galleryUrl)
    if (!trackedLinkId) {
      return NextResponse.json(
        { error: 'URL inválida — UUID do tracked link não encontrado' },
        { status: 400 },
      )
    }

    const link = await fetchTrackedLink(trackedLinkId)
    const property = link.property
    const pictures = collectDwvPicturePaths(link)
    const fotoUrls = pictures.map(dwvPictureUrl)
    const displayTitle = dwvDisplayTitle(link)

    const preview = {
      trackedLinkId,
      title: displayTitle,
      empreendimento: property?.reDevelopment?.name?.trim() || null,
      unidade: property?.name?.trim() || null,
      dwvPropertyId: property?.id,
      propertyType: property?.propertyType,
      status: property?.status,
      totalFotos: fotoUrls.length,
    }

    if (body.dryRun) {
      return NextResponse.json({ ok: true, dryRun: true, ...preview })
    }

    if (fotoUrls.length === 0) {
      return NextResponse.json({ error: 'Galeria sem fotos', ...preview }, { status: 404 })
    }

    const supabase = serviceClient()
    const now = new Date().toISOString()
    const requestedId =
      body.propertyId?.trim() ||
      `dwv-${property?.id?.slice(0, 8) || trackedLinkId.slice(0, 8)}`
    const canonicalSource = `https://lp.dwvapp.com.br/${trackedLinkId}`

    const offset = Math.max(0, Number(body.offset) || 0)
    const limit = Math.min(8, Math.max(1, Number(body.limit) || BATCH_DEFAULT))
    const isFirstBatch = offset === 0

    // Já existe imóvel com este link DWV?
    const { data: byLink } = await supabase
      .from('properties')
      .select('id, title, status')
      .ilike('source_url', `%${trackedLinkId}%`)
      .order('updated_at', { ascending: false })
      .limit(10)

    const existingByLink = (byLink ?? []).find((p) => p.id !== requestedId)
    if (existingByLink && isFirstBatch) {
      // Remove rascunho órfão que tentou ser criado agora
      if (requestedId && requestedId !== existingByLink.id) {
        await supabase
          .from('properties')
          .delete()
          .eq('id', requestedId)
          .eq('status', 'rascunho')
      }
      return NextResponse.json(
        {
          ok: false,
          duplicate: true,
          existingId: existingByLink.id,
          existingTitle: existingByLink.title,
          error: `Este imóvel já está cadastrado pelo link DWV (“${existingByLink.title || existingByLink.id}”). Rascunho descartado.`,
        },
        { status: 409 },
      )
    }

    // Se o link já aponta para o próprio requestedId, reutiliza
    const propertyId =
      (byLink ?? []).find((p) => p.id === requestedId)?.id ||
      existingByLink?.id ||
      requestedId

    if (isFirstBatch) {
      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .maybeSingle()

      if (!existing) {
        const title = displayTitle
        const emp = preview.empreendimento || title
        const { error: insertErr } = await supabase.from('properties').insert({
          id: propertyId,
          kind: 'apartamento',
          mode: 'venda',
          status: 'rascunho',
          title,
          unit_name: emp,
          empreendimento: emp,
          unidade: preview.unidade,
          location: '',
          city: '',
          city_key: '',
          bedrooms: 0,
          bathrooms: 0,
          parking: 0,
          area: 0,
          price: 'Sob consulta',
          source_url: canonicalSource,
          cover_url: null,
          images: [],
          videos: [],
          unit_features: [],
          amenities: [],
          created_at: now,
          updated_at: now,
        })
        if (insertErr) {
          return NextResponse.json({ error: insertErr.message }, { status: 500 })
        }
      } else {
        await supabase
          .from('properties')
          .update({ source_url: canonicalSource, updated_at: now })
          .eq('id', propertyId)
      }

      if (body.replacePhotos !== false) {
        await supabase.from('property_images').delete().eq('property_id', propertyId)
      }
    }

    const { data: maxOrderRow } = await supabase
      .from('property_images')
      .select('sort_order')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    let sortOrder = (maxOrderRow?.sort_order ?? -1) + 1
    const batch = fotoUrls.slice(offset, offset + limit)
    const stored: StoredImage[] = []
    const errors: string[] = []

    for (const url of batch) {
      try {
        const { buffer, width, height, mimeType, ext } = await downloadAsWebp(url)
        const fileName = `${crypto.randomUUID()}.${ext}`
        const path = propertyImagePath(propertyId, fileName)

        const { error: upErr } = await supabase.storage
          .from('property-photos')
          .upload(path, buffer, {
            contentType: mimeType,
            upsert: false,
            cacheControl: '31536000',
          })
        if (upErr) throw new Error(`Storage: ${upErr.message}`)

        const { error: rowErr } = await supabase.from('property_images').insert({
          property_id: propertyId,
          path,
          width,
          height,
          size_bytes: buffer.byteLength,
          mime_type: mimeType,
          sort_order: sortOrder++,
        })
        if (rowErr) {
          throw new Error(
            `Banco: ${rowErr.message}${
              /property_images|does not exist|schema cache/i.test(rowErr.message)
                ? ' — rode supabase/schema-storage-paths.sql no SQL Editor'
                : ''
            }`,
          )
        }

        stored.push({
          path,
          width,
          height,
          sizeBytes: buffer.byteLength,
          mimeType,
        })
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e))
      }
    }

    const nextOffset = offset + batch.length
    const done = nextOffset >= fotoUrls.length

    if (isFirstBatch && stored[0]) {
      await supabase
        .from('properties')
        .update({
          cover_path: stored[0].path,
          cover_url: null,
          images: [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)
    }

    return NextResponse.json({
      ok: true,
      propertyId,
      title: preview.title,
      empreendimento: preview.empreendimento,
      unidade: preview.unidade,
      totalFotos: fotoUrls.length,
      offset,
      nextOffset,
      done,
      batch_fotos: stored.length,
      total_fotos: stored.length,
      falhas: errors.length,
      errors: errors.slice(0, 5),
      coverPath: stored[0]?.path ?? null,
      images: stored,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
