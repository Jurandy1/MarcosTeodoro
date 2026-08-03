import type { PropertyMode } from '@/lib/properties'

/** Normaliza para comparar nomes (acentos, case, espaços). */
export function normalizePropertyName(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function samePropertyName(a?: string | null, b?: string | null) {
  const na = normalizePropertyName(a || '')
  const nb = normalizePropertyName(b || '')
  if (!na || !nb) return false
  return na === nb
}

/**
 * Monta o título público sem duplicar empreendimento e unidade
 * (ex.: evita "PORTO BELO ALL RESORT — PORTO BELO ALL RESORT").
 */
export function formatPropertyTitle(
  empreendimento?: string | null,
  unidade?: string | null,
): string {
  const emp = (empreendimento || '').trim()
  const und = (unidade || '').trim()
  if (emp && und && !samePropertyName(emp, und)) return `${emp} — ${und}`
  return emp || und || ''
}

/**
 * Se o título já veio como "X — X", reduz para "X".
 * Também remove unidade redundante colada no fim.
 */
export function dedupePropertyTitle(title?: string | null): string {
  const raw = (title || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  if (!raw) return ''

  const parts = raw.split(/\s+[—–\-]\s+/).map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2 && samePropertyName(parts[0], parts[1])) {
    return parts[0]
  }
  // "EMP — EMP — Unidade" → "EMP — Unidade" se os dois primeiros forem iguais
  if (parts.length >= 3 && samePropertyName(parts[0], parts[1])) {
    return formatPropertyTitle(parts[0], parts.slice(2).join(' — '))
  }
  return raw
}

/** Unidade só vale se for distinta do empreendimento. */
export function distinctUnidade(
  empreendimento?: string | null,
  unidade?: string | null,
): string | undefined {
  const und = (unidade || '').trim()
  if (!und) return undefined
  if (samePropertyName(empreendimento, und)) return undefined
  return und
}

/** Título canônico a partir dos campos (ou fallback no title salvo). */
export function resolvePropertyTitle(opts: {
  title?: string | null
  empreendimento?: string | null
  unitName?: string | null
  unidade?: string | null
}): string {
  const fromParts = formatPropertyTitle(
    opts.empreendimento || opts.unitName,
    distinctUnidade(opts.empreendimento || opts.unitName, opts.unidade),
  )
  if (fromParts) return fromParts
  return dedupePropertyTitle(opts.title)
}

/** Path público do imóvel (/vendas/id ou /aluguel/id). */
export function propertyPublicPath(
  id: string,
  mode: PropertyMode | string | undefined = 'venda',
): string {
  const base = mode === 'aluguel' ? '/aluguel' : '/vendas'
  return `${base}/${id}`
}

export function propertyAbsoluteUrl(
  id: string,
  mode?: PropertyMode | string,
  origin?: string,
): string {
  const base =
    origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://marcosteodoro.com.br'
  return `${base.replace(/\/$/, '')}${propertyPublicPath(id, mode)}`
}
