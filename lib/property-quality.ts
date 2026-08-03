import type { AdminProperty } from '@/lib/admin-store'
import { CITY_FILTERS } from '@/lib/properties'
import { samePropertyName } from '@/lib/property-title'

export type QualityIssue =
  | 'sem_foto'
  | 'sem_cidade'
  | 'sob_consulta'
  | 'sem_specs'
  | 'titulo_duplicado'

export function propertyQualityIssues(p: AdminProperty): QualityIssue[] {
  const issues: QualityIssue[] = []
  const hasPhoto = Boolean(
    p.coverPath || p.imageAssets?.length || p.images?.length || p.image,
  )
  if (!hasPhoto) issues.push('sem_foto')

  const city = (p.cityKey || p.city || '').trim()
  if (!city || !(CITY_FILTERS as readonly string[]).includes(city)) {
    issues.push('sem_cidade')
  }

  const price = (p.price || '').trim().toLowerCase()
  if (!price || price.includes('sob consulta') || price === 'r$ —' || price === '—') {
    issues.push('sob_consulta')
  }

  const beds = Number(p.bedrooms) || 0
  const area = Number(p.areaPrivate ?? p.area) || 0
  if (beds <= 0 || area <= 0) issues.push('sem_specs')

  const emp = p.empreendimento || p.unitName || ''
  if (p.unidade && samePropertyName(emp, p.unidade)) issues.push('titulo_duplicado')
  if ((p.title || '').match(/\s+[—–\-]\s+/) && samePropertyName(
    (p.title || '').split(/\s+[—–\-]\s+/)[0],
    (p.title || '').split(/\s+[—–\-]\s+/)[1],
  )) {
    if (!issues.includes('titulo_duplicado')) issues.push('titulo_duplicado')
  }

  return issues
}

export const QUALITY_LABELS: Record<QualityIssue, string> = {
  sem_foto: 'Sem foto',
  sem_cidade: 'Cidade inválida',
  sob_consulta: 'Preço genérico',
  sem_specs: 'Falta dorm/área',
  titulo_duplicado: 'Título duplicado',
}

/** Mensagens de bloqueio ao publicar como pronto. */
export function publishBlockers(opts: {
  cityKey: string
  price: string
  priceValue?: string
  sobConsulta: boolean
  bedrooms: string
  areaPrivate: string
  imagesCount: number
}): string[] {
  const blockers: string[] = []
  if (opts.imagesCount < 1) blockers.push('Adicione pelo menos 1 foto.')
  if (!(CITY_FILTERS as readonly string[]).includes(opts.cityKey)) {
    blockers.push('Selecione uma cidade válida da lista.')
  }
  const price = opts.price.trim()
  if (!opts.sobConsulta) {
    if (!price || /sob consulta/i.test(price)) {
      blockers.push('Informe o valor ou marque “Sob consulta”.')
    }
  }
  if (!(Number(opts.bedrooms) > 0)) blockers.push('Informe os dormitórios.')
  if (!(Number(opts.areaPrivate) > 0)) blockers.push('Informe a área privativa.')
  return blockers
}
