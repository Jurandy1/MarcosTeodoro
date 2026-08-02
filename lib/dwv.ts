/** Cliente DWV GraphQL (hotsite / tracked link) — sem token para getTrackedLink */

export const DWV_GRAPHQL = 'https://dwvapp.com.br/api/graphql'
export const DWV_S3_BASE = 'https://dwvimages.s3.amazonaws.com'

export type DwvTrackedLink = {
  id: string
  title: string | null
  property: {
    id: string
    name: string | null
    propertyType: string | null
    status: string | null
    files: { pictures: string[] } | null
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
        files { pictures }
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
  if (/^https?:\/\//i.test(relativePath)) return relativePath
  return `${DWV_S3_BASE}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`
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
