/** Cliente DWV GraphQL (hotsite / tracked link) */

export const DWV_GRAPHQL = 'https://dwvapp.com.br/api/graphql'
export const DWV_S3_BASE = 'https://dwvimages.s3.amazonaws.com'

export type DwvFiles = {
  pictures?: string[] | null
  progressPictures?: string[] | null
  blueprints?: string[] | null
}

export type DwvGallery = {
  id?: string
  title?: string | null
  files?: string[] | null
}

export type DwvDevelopment = {
  id: string
  name: string | null
  coverPath?: string | null
  files?: DwvFiles | null
  galleries?: DwvGallery[] | null
}

export type DwvTrackedLink = {
  id: string
  title: string | null
  property: {
    id: string
    name: string | null
    propertyType: string | null
    status: string | null
    coverPath?: string | null
    files: DwvFiles | null
    galleries?: DwvGallery[] | null
    reDevelopment?: DwvDevelopment | null
  } | null
  user: {
    id: string
    name: string | null
    email: string | null
    pixel: string | null
    username: string | null
    files: { profile: string | null } | null
  } | null
}

const GET_TRACKED_LINK = `
  query getTrackedLink($id: String!) {
    getTrackedLink(id: $id) {
      id
      title
      property {
        id
        name
        propertyType
        status
        coverPath
        files { pictures progressPictures blueprints }
        galleries { id title files }
        reDevelopment {
          id
          name
          coverPath
          files { pictures progressPictures blueprints }
          galleries { id title files }
        }
      }
      user {
        id
        name
        email
        pixel
        username
        files { profile }
      }
    }
  }
`

const DWV_UUID_REGEX =
  /dwvapp\.com\.br\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i

export function extractTrackedLinkId(input: string): string | null {
  const fromHost = input.match(DWV_UUID_REGEX)?.[1]
  if (fromHost) return fromHost
  const any = input.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  )
  return any?.[0] ?? null
}

export function dwvPictureUrl(relativePath: string): string {
  if (!relativePath) return ''
  if (/^https?:\/\//i.test(relativePath)) return relativePath
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return `${DWV_S3_BASE}${path}`
}

function pushPaths(out: string[], paths: (string | null | undefined)[] | null | undefined) {
  if (!paths?.length) return
  for (const p of paths) {
    if (p && typeof p === 'string') out.push(p)
  }
}

/**
 * Coleta paths/URLs de fotos.
 * UNIT: fotos costumam estar no empreendimento (reDevelopment), não na unidade.
 * THIRD_PART_PROPERTY: em property.files.pictures.
 */
export function collectDwvPicturePaths(link: DwvTrackedLink): string[] {
  const paths: string[] = []
  const prop = link.property
  if (!prop) return paths

  pushPaths(paths, prop.files?.pictures)
  for (const g of prop.galleries ?? []) pushPaths(paths, g.files)

  const dev = prop.reDevelopment
  if (dev) {
    pushPaths(paths, dev.files?.pictures)
    for (const g of dev.galleries ?? []) pushPaths(paths, g.files)
    // Se ainda vazio, usa progress/blueprints como fallback visual
    if (paths.length === 0) {
      pushPaths(paths, dev.files?.progressPictures)
      pushPaths(paths, dev.files?.blueprints)
    }
  }

  // Fallback: progress da própria unidade
  if (paths.length === 0) {
    pushPaths(paths, prop.files?.progressPictures)
    pushPaths(paths, prop.files?.blueprints)
  }

  // Dedup preservando ordem
  const seen = new Set<string>()
  return paths.filter((p) => {
    const key = p.replace(/^https?:\/\/[^/]+/i, '').replace(/^\//, '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function dwvDisplayTitle(link: DwvTrackedLink): string {
  const prop = link.property
  const unit = prop?.name?.trim()
  const emp = prop?.reDevelopment?.name?.trim()
  if (emp && unit && unit !== emp) return `${emp} — ${unit}`
  return emp || unit || link.title?.trim() || 'Imóvel DWV'
}

export async function callDwv<T>(
  operationName: string,
  query: string,
  variables: Record<string, unknown>,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Origin: 'https://lp.dwvapp.com.br',
    Referer: 'https://lp.dwvapp.com.br/',
  }
  if (token) headers.token = token

  const res = await fetch(DWV_GRAPHQL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ operationName, query, variables }),
  })

  const json = (await res.json()) as { data?: T; errors?: unknown }
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors))
  }
  if (!json.data) {
    throw new Error('Resposta DWV sem data')
  }
  return json.data
}

export async function fetchTrackedLink(trackedLinkId: string): Promise<DwvTrackedLink> {
  const data = await callDwv<{ getTrackedLink: DwvTrackedLink | null }>(
    'getTrackedLink',
    GET_TRACKED_LINK,
    { id: trackedLinkId },
  )
  if (!data.getTrackedLink) {
    throw new Error('Galeria não encontrada')
  }
  return data.getTrackedLink
}
