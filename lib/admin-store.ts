import type { CatalogProperty } from '@/lib/properties'
import type { StoredImage } from '@/lib/storage'

const STORAGE_KEY = 'marcos.admin.properties.v1'
const CATALOG_KEY = 'marcos.admin.catalog.v1'

export type AdminProperty = CatalogProperty & {
  reforco?: string
  sourceUrl?: string
  /** Fotos: path relativo + metadata (nunca URL completa) */
  imageAssets?: StoredImage[]
  /** @deprecated use imageAssets — strings absolutas só para demos */
  images?: string[]
  updatedAt: string
  createdAt: string
  status: 'rascunho' | 'pronto'
  isFeatured?: boolean
  featuredOrder?: number
  coverPath?: string
}

type CatalogLists = {
  empreendimentos: string[]
  /** unidades por empreendimento */
  unidadesByEmpreendimento: Record<string, string[]>
}

const SEED_EMPREENDIMENTOS = [
  'Atlantic Paradise',
  'Emerald Bay Residence',
  'Horizon Tower',
  'Bella Vista Residence Club',
]

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function readCatalog(): CatalogLists {
  if (!canUseStorage()) {
    return { empreendimentos: [...SEED_EMPREENDIMENTOS], unidadesByEmpreendimento: {} }
  }
  try {
    const raw = localStorage.getItem(CATALOG_KEY)
    if (!raw) {
      return { empreendimentos: [...SEED_EMPREENDIMENTOS], unidadesByEmpreendimento: {} }
    }
    const parsed = JSON.parse(raw) as CatalogLists
    return {
      empreendimentos: Array.from(
        new Set([...(parsed.empreendimentos ?? []), ...SEED_EMPREENDIMENTOS]),
      ),
      unidadesByEmpreendimento: parsed.unidadesByEmpreendimento ?? {},
    }
  } catch {
    return { empreendimentos: [...SEED_EMPREENDIMENTOS], unidadesByEmpreendimento: {} }
  }
}

function writeCatalog(catalog: CatalogLists) {
  if (!canUseStorage()) return
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog))
}

/** Lista de empreendimentos (salvos + seeds + já usados nos imóveis). */
export function listEmpreendimentos(): string[] {
  const catalog = readCatalog()
  const fromProps = listAdminProperties()
    .map((p) => p.empreendimento || p.unitName || p.title)
    .filter(Boolean) as string[]
  return Array.from(new Set([...catalog.empreendimentos, ...fromProps])).sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )
}

/** Unidades já usadas naquele empreendimento. */
export function listUnidades(empreendimento: string): string[] {
  if (!empreendimento) return []
  const catalog = readCatalog()
  const fromCatalog = catalog.unidadesByEmpreendimento[empreendimento] ?? []
  const fromProps = listAdminProperties()
    .filter((p) => (p.empreendimento || p.unitName || p.title) === empreendimento)
    .map((p) => p.unidade)
    .filter(Boolean) as string[]
  return Array.from(new Set([...fromCatalog, ...fromProps])).sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )
}

/** Guarda empreendimento/unidade novos para aparecerem no select depois. */
export function rememberCatalogEntry(empreendimento: string, unidade?: string) {
  const name = empreendimento.trim()
  if (!name) return
  const catalog = readCatalog()
  if (!catalog.empreendimentos.includes(name)) {
    catalog.empreendimentos.push(name)
  }
  if (unidade?.trim()) {
    const list = catalog.unidadesByEmpreendimento[name] ?? []
    if (!list.includes(unidade.trim())) {
      catalog.unidadesByEmpreendimento[name] = [...list, unidade.trim()]
    }
  }
  writeCatalog(catalog)
}

export function listAdminProperties(): AdminProperty[] {
  if (!canUseStorage()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AdminProperty[]
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      : []
  } catch {
    return []
  }
}

export function getAdminProperty(id: string): AdminProperty | null {
  return listAdminProperties().find((p) => p.id === id) ?? null
}

export function saveAdminProperty(property: AdminProperty): void {
  if (!canUseStorage()) return
  rememberCatalogEntry(property.empreendimento || property.title, property.unidade)
  const all = listAdminProperties().filter((p) => p.id !== property.id)
  all.unshift(property)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteAdminProperty(id: string): void {
  if (!canUseStorage()) return
  const all = listAdminProperties().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

/** Redimensiona imagem para caber no localStorage até o banco existir. */
export function fileToDataUrl(file: File, maxSide = 1400, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida'))
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas indisponível'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
