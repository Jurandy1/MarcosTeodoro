import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { propertyImagePath } from '@/lib/storage'
import type { StoredImage } from '@/lib/storage'
import { isAllowedAdminEmail } from '@/lib/admin-auth'

export const runtime = 'nodejs'

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

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!isAllowedAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Sem permissão de admin' }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get('file')
  const imovelId = String(form.get('imovelId') || form.get('folder') || 'geral')
  const width = Number(form.get('width') || 0)
  const height = Number(form.get('height') || 0)

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Apenas imagens' }, { status: 400 })
  }

  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  // Sempre UUID.webp — nunca o nome original do upload
  const fileName = `${uuid}.webp`
  const path = propertyImagePath(imovelId, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await service.storage.from('property-photos').upload(path, buffer, {
    contentType: 'image/webp',
    upsert: false,
    cacheControl: '31536000',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const stored: StoredImage = {
    path,
    width: Number.isFinite(width) ? width : 0,
    height: Number.isFinite(height) ? height : 0,
    sizeBytes: buffer.byteLength,
    mimeType: 'image/webp',
  }

  return NextResponse.json(stored)
}

export async function DELETE(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!isAllowedAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Sem permissão de admin' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as {
    paths?: string[]
    path?: string
  } | null

  const paths = [
    ...(body?.paths ?? []),
    ...(body?.path ? [body.path] : []),
  ].filter((p) => typeof p === 'string' && p.startsWith('imoveis/'))

  if (paths.length === 0) {
    return NextResponse.json({ error: 'Nenhum path válido' }, { status: 400 })
  }

  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { error } = await service.storage.from('property-photos').remove(paths)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, removed: paths.length })
}
