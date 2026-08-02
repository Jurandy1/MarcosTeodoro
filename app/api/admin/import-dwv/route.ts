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
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

async function downloadAsWebp(url: string): Promise<{
  buffer: Buffer
  width: number
  height: number
}> {
  const sharp = (await import('sharp')).default
  const res = await fetch(url, {
    headers: { Referer: 'https://lp.dwvapp.com.br/' },
  })
  if (!res.ok) throw new Error(`Falha ao baixar foto (${res.status})`)
  const input = Buffer.from(await res.arrayBuffer())
  const image = sharp(input).rotate().resize({
    width: 1600,
    height: 1600,
    fit: 'inside',
    withoutEnlargement: true,
  })
  const meta = await image.metadata()
  const buffer = await image.webp({ quality: 82 }).toBuffer()
  const out = await sharp(buffer).metadata()
  return {
    buffer,
    width: out.width || meta.width || 0,
    height: out.height || meta.height || 0,
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
    const propertyId =
      body.propertyId?.trim() ||
      `dwv-${property?.id?.slice(0, 8) || trackedLinkId.slice(0, 8)}`

    const offset = Math.max(0, Number(body.offset) || 0)
    const limit = Math.min(8, Math.max(1, Number(body.limit) || BATCH_DEFAULT))
    const isFirstBatch = offset === 0

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
          source_url: galleryUrl,
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
          .update({ source_url: galleryUrl, updated_at: now })
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
        const { buffer, width, height } = await downloadAsWebp(url)
        const fileName = `${crypto.randomUUID()}.webp`
        const path = propertyImagePath(propertyId, fileName)

        const { error: upErr } = await supabase.storage
          .from('property-photos')
          .upload(path, buffer, {
            contentType: 'image/webp',
            upsert: false,
            cacheControl: '31536000',
          })
        if (upErr) throw new Error(upErr.message)

        const { error: rowErr } = await supabase.from('property_images').insert({
          property_id: propertyId,
          path,
          width,
          height,
          size_bytes: buffer.byteLength,
          mime_type: 'image/webp',
          sort_order: sortOrder++,
        })
        if (rowErr) throw new Error(rowErr.message)

        stored.push({
          path,
          width,
          height,
          sizeBytes: buffer.byteLength,
          mimeType: 'image/webp',
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
