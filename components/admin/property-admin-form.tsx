'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ClipboardEvent } from 'react'
import { CreatableSelect } from '@/components/admin/creatable-select'
import { type AdminProperty } from '@/lib/admin-store'
import {
  formatCep,
  isCompleteCep,
  lookupCep,
  matchCityKey,
} from '@/lib/cep'
import { geocodeAddress } from '@/lib/geocode'
import { CITY_FILTERS } from '@/lib/properties'
import {
  parseListingPaste,
  slugifyId,
  type ParsedListing,
} from '@/lib/listing-paste-parser'
import { storageUrl, type StoredImage } from '@/lib/storage'
import {
  fetchAdminProperty,
  fetchEmpreendimentosDb,
  fetchUnidadesDb,
  findPropertyByDwvLink,
  deleteAdminPropertyDb,
  saveAdminPropertyDb,
} from '@/lib/supabase/properties-api'
import { DwvDuplicateError, importDwvGallery } from '@/lib/supabase/import-dwv'
import { removePropertyPhoto, uploadPropertyPhotos } from '@/lib/supabase/storage'
import {
  distinctUnidade,
  formatPropertyTitle,
  samePropertyName,
} from '@/lib/property-title'

type FormState = {
  id: string
  empreendimento: string
  unidade: string
  title: string
  kind: 'apartamento' | 'casa'
  mode: 'venda' | 'aluguel'
  badge: string
  cityKey: string
  location: string
  city: string
  address: string
  cep: string
  bedrooms: string
  bathrooms: string
  suites: string
  parking: string
  areaPrivate: string
  areaTotal: string
  price: string
  priceValue: string
  entrada: string
  reforco: string
  parcelamento: string
  unitFeaturesText: string
  amenitiesText: string
  sourceUrl: string
  lat: string
  lng: string
  images: StoredImage[]
}

const emptyForm = (): FormState => ({
  id: '',
  empreendimento: '',
  unidade: '',
  title: '',
  kind: 'apartamento',
  mode: 'venda',
  badge: '',
  cityKey: 'Itapema',
  location: '',
  city: '',
  address: '',
  cep: '',
  bedrooms: '',
  bathrooms: '',
  suites: '',
  parking: '',
  areaPrivate: '',
  areaTotal: '',
  price: '',
  priceValue: '',
  entrada: '',
  reforco: '',
  parcelamento: '',
  unitFeaturesText: '',
  amenitiesText: '',
  sourceUrl: '',
  lat: '',
  lng: '',
  images: [],
})

function fromAdmin(p: AdminProperty): FormState {
  return {
    id: p.id,
    empreendimento: p.empreendimento || p.unitName || p.title,
    unidade: distinctUnidade(p.empreendimento || p.unitName || p.title, p.unidade) || '',
    title: p.title,
    kind: p.kind,
    mode: p.mode,
    badge: p.badge ?? '',
    cityKey: p.cityKey,
    location: p.location,
    city: p.city,
    address: p.address ?? '',
    cep: p.cep ?? '',
    bedrooms: String(p.bedrooms ?? ''),
    bathrooms: String(p.bathrooms ?? ''),
    suites: p.suites != null ? String(p.suites) : '',
    parking: String(p.parking ?? ''),
    areaPrivate: p.areaPrivate != null ? String(p.areaPrivate) : String(p.area ?? ''),
    areaTotal: p.areaTotal != null ? String(p.areaTotal) : '',
    price: p.price,
    priceValue: p.priceValue != null ? String(p.priceValue) : '',
    entrada: p.entrada ?? '',
    reforco: p.reforco ?? '',
    parcelamento: p.parcelamento ?? '',
    unitFeaturesText: (p.unitFeatures ?? []).join('\n'),
    amenitiesText: (p.amenities ?? []).join('\n'),
    sourceUrl: p.sourceUrl ?? '',
    lat: p.lat != null ? String(p.lat) : '',
    lng: p.lng != null ? String(p.lng) : '',
    images: p.imageAssets?.length
      ? p.imageAssets
      : (p.images ?? [])
          .filter((src) => src && !src.startsWith('http') && !src.startsWith('data:'))
          .map((path) => ({
            path,
            width: 0,
            height: 0,
            sizeBytes: 0,
            mimeType: 'image/webp',
          })),
  }
}

function linesToList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•\-–—]+/, '').trim())
    .filter(Boolean)
}

function displayTitle(empreendimento: string, unidade: string) {
  return formatPropertyTitle(empreendimento, unidade)
}

function norm(s: string) {
  return s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

function listsEqual(a: string, b: string) {
  const la = a
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const lb = b
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (la.length !== lb.length) return false
  return la.every((line, i) => norm(line) === norm(lb[i]))
}

export type PasteChange = { label: string; from: string; to: string }

/**
 * Aplica o anúncio colado e lista o que mudou em relação ao formulário atual.
 * Só sobrescreve campos presentes no texto parseado.
 */
function applyParsedWithDiff(
  f: FormState,
  parsed: ParsedListing,
): { next: FormState; changes: PasteChange[]; filled: string[] } {
  const changes: PasteChange[] = []
  const filled: string[] = []
  const next: FormState = { ...f }

  const setIfParsed = (
    label: string,
    hasValue: boolean,
    current: string,
    incoming: string,
    apply: (v: string) => void,
  ) => {
    if (!hasValue) return
    const to = incoming.trim()
    if (!to && !current) return
    if (norm(current) === norm(to)) {
      filled.push(label)
      return
    }
    changes.push({
      label,
      from: current.trim() || '—',
      to: to || '—',
    })
    apply(to)
    filled.push(label)
  }

  const emp = parsed.empreendimento || parsed.unitName
  if (emp) {
    setIfParsed('Empreendimento', true, f.empreendimento, emp, (v) => {
      next.empreendimento = v
    })
  }
  if (parsed.unidade != null && parsed.unidade !== '') {
    const und = distinctUnidade(next.empreendimento || emp || '', parsed.unidade)
    if (und) {
      setIfParsed('Unidade', true, f.unidade, und, (v) => {
        next.unidade = v
      })
    } else if (samePropertyName(f.unidade, next.empreendimento || emp || '')) {
      // Unidade colada é igual ao empreendimento → limpa duplicata
      if (f.unidade) {
        changes.push({ label: 'Unidade', from: f.unidade, to: '—' })
        next.unidade = ''
      }
    }
  }

  next.title = displayTitle(next.empreendimento, next.unidade)

  if (parsed.kind) {
    if (f.kind !== parsed.kind) {
      changes.push({ label: 'Tipo', from: f.kind, to: parsed.kind })
    }
    next.kind = parsed.kind
    filled.push('Tipo')
  }
  if (parsed.mode) {
    if (f.mode !== parsed.mode) {
      changes.push({ label: 'Finalidade', from: f.mode, to: parsed.mode })
    }
    next.mode = parsed.mode
    filled.push('Finalidade')
  }

  setIfParsed('Cidade', Boolean(parsed.cityKey || parsed.city), f.cityKey, parsed.cityKey || parsed.city || '', (v) => {
    next.cityKey = v
    next.city = v
    next.location = parsed.location || v
  })

  setIfParsed('Endereço', Boolean(parsed.address), f.address, parsed.address || '', (v) => {
    next.address = v
  })
  setIfParsed('CEP', Boolean(parsed.cep), f.cep, parsed.cep || '', (v) => {
    next.cep = v
  })

  setIfParsed(
    'Dormitórios',
    parsed.bedrooms != null,
    f.bedrooms,
    parsed.bedrooms != null ? String(parsed.bedrooms) : '',
    (v) => {
      next.bedrooms = v
    },
  )
  setIfParsed(
    'Banheiros',
    parsed.bathrooms != null,
    f.bathrooms,
    parsed.bathrooms != null ? String(parsed.bathrooms) : '',
    (v) => {
      next.bathrooms = v
    },
  )
  setIfParsed(
    'Suítes',
    parsed.suites != null,
    f.suites,
    parsed.suites != null ? String(parsed.suites) : '',
    (v) => {
      next.suites = v
    },
  )
  setIfParsed(
    'Vagas',
    parsed.parking != null,
    f.parking,
    parsed.parking != null ? String(parsed.parking) : '',
    (v) => {
      next.parking = v
    },
  )
  setIfParsed(
    'Área privativa',
    parsed.areaPrivate != null,
    f.areaPrivate,
    parsed.areaPrivate != null ? String(parsed.areaPrivate) : '',
    (v) => {
      next.areaPrivate = v
    },
  )
  setIfParsed(
    'Área total',
    parsed.areaTotal != null,
    f.areaTotal,
    parsed.areaTotal != null ? String(parsed.areaTotal) : '',
    (v) => {
      next.areaTotal = v
    },
  )

  setIfParsed('Valor', Boolean(parsed.price), f.price, parsed.price || '', (v) => {
    next.price = v
  })
  setIfParsed(
    'Valor numérico',
    parsed.priceValue != null,
    f.priceValue,
    parsed.priceValue != null ? String(parsed.priceValue) : '',
    (v) => {
      next.priceValue = v
    },
  )
  setIfParsed('Entrada', Boolean(parsed.entrada), f.entrada, parsed.entrada || '', (v) => {
    next.entrada = v
  })
  setIfParsed('Reforço', Boolean(parsed.reforco), f.reforco, parsed.reforco || '', (v) => {
    next.reforco = v
  })
  setIfParsed(
    'Parcelamento',
    Boolean(parsed.parcelamento),
    f.parcelamento,
    parsed.parcelamento || '',
    (v) => {
      next.parcelamento = v
    },
  )

  if (parsed.unitFeatures?.length) {
    const to = parsed.unitFeatures.join('\n')
    if (!listsEqual(f.unitFeaturesText, to)) {
      changes.push({
        label: 'Itens da unidade',
        from: f.unitFeaturesText.trim() ? `${f.unitFeaturesText.trim().split(/\n/).length} itens` : '—',
        to: `${parsed.unitFeatures.length} itens`,
      })
      next.unitFeaturesText = to
    }
    filled.push('Itens unidade')
  }
  if (parsed.amenities?.length) {
    const to = parsed.amenities.join('\n')
    if (!listsEqual(f.amenitiesText, to)) {
      changes.push({
        label: 'Itens do empreendimento',
        from: f.amenitiesText.trim() ? `${f.amenitiesText.trim().split(/\n/).length} itens` : '—',
        to: `${parsed.amenities.length} itens`,
      })
      next.amenitiesText = to
    }
    filled.push('Itens prédio')
  }

  setIfParsed('Link DWV', Boolean(parsed.sourceUrl), f.sourceUrl, parsed.sourceUrl || '', (v) => {
    next.sourceUrl = v
  })

  // Mantém o id do imóvel em edição
  if (!next.id) {
    const empName = next.empreendimento
    const und = next.unidade
    next.id = empName
      ? slugifyId(und ? `${empName}-${und}` : empName)
      : `imovel-${Date.now()}`
  }

  return { next, changes, filled }
}

function changeChips(changes: PasteChange[]): string[] {
  if (changes.length === 0) return ['Nada novo']
  return changes.map((c) => `↻ ${c.label}`)
}

function Step({
  n,
  label,
  active,
  done,
}: {
  n: number
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className={`shrink-0 w-7 h-7 rounded-full text-[0.72rem] font-semibold flex items-center justify-center ${
          done
            ? 'bg-[#1f6b4a] text-white'
            : active
              ? 'bg-[#0e6b7a] text-white'
              : 'bg-[#e8e4dc] text-[#8a9098]'
        }`}
      >
        {done ? '✓' : n}
      </span>
      <span
        className={`text-[0.72rem] font-semibold tracking-[.06em] uppercase truncate ${
          active || done ? 'text-[#0b1420]' : 'text-[#9aa0a6]'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export function PropertyAdminForm({ propertyId }: { propertyId?: string }) {
  const router = useRouter()
  const isEdit = Boolean(propertyId)
  const pasteRef = useRef<HTMLTextAreaElement>(null)
  const [ready, setReady] = useState(!isEdit)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [paste, setPaste] = useState('')
  const [chips, setChips] = useState<string[]>([])
  const [pasteChanges, setPasteChanges] = useState<PasteChange[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [busyPhotos, setBusyPhotos] = useState(false)
  const [photoProgress, setPhotoProgress] = useState<string | null>(null)
  const [uploadFolder] = useState(
    () => `draft-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
  )
  const [saving, setSaving] = useState(false)
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [empOptions, setEmpOptions] = useState<string[]>([])
  const [unitOptions, setUnitOptions] = useState<string[]>([])
  const cepReqRef = useRef(0)
  const geoReqRef = useRef(0)

  useEffect(() => {
    void fetchEmpreendimentosDb().then(setEmpOptions)
  }, [])

  useEffect(() => {
    void fetchUnidadesDb(form.empreendimento).then(setUnitOptions)
  }, [form.empreendimento])

  useEffect(() => {
    if (!propertyId) {
      setReady(true)
      setTimeout(() => pasteRef.current?.focus(), 120)
      return
    }
    void (async () => {
      try {
        const existing = await fetchAdminProperty(propertyId)
        if (existing) {
          setForm(fromAdmin(existing))
          setCreatedAt(existing.createdAt)
        } else {
          setToast('Imóvel não encontrado.')
        }
      } catch (e) {
        setToast(e instanceof Error ? e.message : 'Erro ao carregar imóvel')
      } finally {
        setReady(true)
      }
    })()
  }, [propertyId])

  const applyGeocode = async (rawAddress: string, opts?: { silent?: boolean }) => {
    const q = rawAddress.trim()
    if (q.length < 5) return
    const req = ++geoReqRef.current
    setGeoStatus('loading')
    try {
      const data = await geocodeAddress(q)
      if (req !== geoReqRef.current) return
      const matched = matchCityKey(data.city, CITY_FILTERS)
      setForm((f) => ({
        ...f,
        // Mantém o endereço colado do anúncio; geocode só completa cidade/CEP/mapa
        address: f.address.trim() || data.address || f.address,
        city: matched || data.city || f.city,
        cityKey: matched || f.cityKey,
        location:
          matched ||
          (data.neighborhood && data.city
            ? `${data.city}, ${data.neighborhood}`
            : data.city || f.location),
        cep: data.cep ? formatCep(data.cep) : f.cep,
        lat: String(data.lat),
        lng: String(data.lng),
      }))
      setGeoStatus('ok')
      setChips((prev) =>
        Array.from(new Set([...prev, 'Endereço', 'Mapa', data.city].filter(Boolean) as string[])),
      )
      if (!opts?.silent) {
        setToast(`Endereço identificado: ${data.city}.`)
      }
    } catch {
      if (req !== geoReqRef.current) return
      setGeoStatus('error')
      if (!opts?.silent) {
        setToast('Não achei o endereço. Ajuste o texto ou informe o CEP.')
      }
    }
  }

  const applyCep = async (rawCep: string, opts?: { silent?: boolean }) => {
    if (!isCompleteCep(rawCep)) return
    const req = ++cepReqRef.current
    setCepStatus('loading')
    try {
      const data = await lookupCep(rawCep)
      if (req !== cepReqRef.current) return
      const matched = matchCityKey(data.city, CITY_FILTERS)
      setForm((f) => ({
        ...f,
        cep: data.cep,
        address: data.address || f.address,
        city: data.city,
        cityKey: matched || f.cityKey,
        location: data.locationLabel || f.location,
        lat: data.lat != null ? String(data.lat) : f.lat,
        lng: data.lng != null ? String(data.lng) : f.lng,
      }))
      setCepStatus('ok')
      setChips((prev) => {
        const extra = ['CEP', data.city, 'Endereço']
        if (data.lat != null) extra.push('Mapa')
        return Array.from(new Set([...prev, ...extra]))
      })
      if (!opts?.silent) {
        setToast(
          data.lat != null
            ? `CEP encontrado: ${data.city} (com mapa).`
            : `CEP encontrado: ${data.city}.`,
        )
      }
    } catch {
      if (req !== cepReqRef.current) return
      setCepStatus('error')
      if (!opts?.silent) setToast('CEP não encontrado. Confira os números.')
    }
  }

  const set =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value
      setForm((f) => ({ ...f, [key]: value }))
    }

  const onEmpreendimentoChange = (value: string) => {
    setForm((f) => ({
      ...f,
      empreendimento: value,
      title: displayTitle(value, f.unidade),
      id: f.id && !f.id.startsWith('imovel-') ? f.id : slugifyId(value) || f.id,
    }))
    if (value && !empOptions.includes(value)) {
      setEmpOptions((prev) => [...prev, value].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    }
  }

  const onUnidadeChange = (value: string) => {
    setForm((f) => ({
      ...f,
      unidade: value,
      title: displayTitle(f.empreendimento, value),
    }))
    if (value && !unitOptions.includes(value)) {
      setUnitOptions((prev) => [...prev, value].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    }
  }

  const onCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value)
    setForm((f) => ({ ...f, cep: formatted }))
    setCepStatus('idle')
    if (isCompleteCep(formatted)) {
      void applyCep(formatted)
    }
  }

  const discardDraftAndOpenExisting = async (
    existingId: string,
    message: string,
    draftId?: string,
  ) => {
    const toDelete = draftId || form.id
    if (
      toDelete &&
      toDelete !== existingId &&
      (/^(draft-|dwv-|imovel-)/i.test(toDelete) || !isEdit)
    ) {
      try {
        await deleteAdminPropertyDb(toDelete)
      } catch {
        /* rascunho pode não existir ainda */
      }
    }
    setToast(message)
    router.replace(`/admin/imoveis/${existingId}`)
    router.refresh()
  }

  const applyText = async (text: string) => {
    const parsed = parseListingPaste(text)
    if (
      !parsed.empreendimento &&
      !parsed.unitName &&
      !parsed.price &&
      !parsed.address &&
      !parsed.cep &&
      !parsed.dwvGalleryId
    ) {
      setToast('Não reconheci o formato. Cole o anúncio completo (com ou sem link DWV).')
      setChips([])
      setPasteChanges([])
      return false
    }

    // Link DWV já cadastrado em OUTRO imóvel? (na edição do mesmo, libera)
    if (parsed.dwvGalleryId || parsed.sourceUrl?.includes('dwvapp.com.br')) {
      const link = parsed.sourceUrl || parsed.dwvGalleryId || ''
      try {
        const existing = await findPropertyByDwvLink(link, propertyId || form.id || undefined)
        if (existing) {
          await discardDraftAndOpenExisting(
            existing.id,
            `Este imóvel já está cadastrado (“${existing.title || existing.id}”). Rascunho descartado — abrindo o existente.`,
            form.id || uploadFolder,
          )
          return false
        }
      } catch {
        /* segue o fluxo normal se a busca falhar */
      }
    }

    const { next: merged, changes, filled } = applyParsedWithDiff(form, parsed)
    setForm(merged)
    setPasteChanges(changes)
    setChips(changes.length > 0 ? changeChips(changes) : filled.map((l) => `✓ ${l}`))

    if (parsed.empreendimento || parsed.unitName) {
      const emp = merged.empreendimento
      if (emp) {
        setEmpOptions((prev) =>
          Array.from(new Set([...prev, emp])).sort((a, b) => a.localeCompare(b, 'pt-BR')),
        )
      }
      if (merged.unidade) {
        setUnitOptions((prev) =>
          Array.from(new Set([...prev, merged.unidade])).sort((a, b) =>
            a.localeCompare(b, 'pt-BR'),
          ),
        )
      }
    }

    const addressChanged = changes.some((c) => c.label === 'Endereço' || c.label === 'CEP')
    if (parsed.cep && isCompleteCep(parsed.cep) && (addressChanged || !form.cep)) {
      void applyCep(parsed.cep, { silent: true })
    } else if (parsed.address && (addressChanged || !form.address)) {
      void applyGeocode(parsed.address, { silent: true })
    }

    // Se as fotos já estão no Storage, não baixa de novo (edição ou re-cole).
    // Para forçar: use “Reimportar fotos deste link”.
    const alreadyHasPhotos = form.images.length > 0
    const shouldImportPhotos =
      Boolean(parsed.dwvGalleryId && parsed.sourceUrl) && !alreadyHasPhotos

    if (shouldImportPhotos && parsed.sourceUrl) {
      const propertyIdLocal = merged.id.trim() || uploadFolder
      setBusyPhotos(true)
      setPhotoProgress('Importando fotos da DWV…')
      setToast(
        changes.length > 0
          ? `${changes.length} campo(s) atualizado(s). Baixando fotos da DWV…`
          : 'Anúncio aplicado. Baixando fotos da DWV…',
      )
      try {
        const result = await importDwvGallery({
          galleryUrl: parsed.sourceUrl,
          propertyId: propertyIdLocal,
          replacePhotos: true,
          onProgress: (done, total) => {
            setPhotoProgress(`Importando fotos DWV ${done}/${total}…`)
          },
        })
        const images = result.images ?? []
        setForm((f) => ({
          ...f,
          id: result.propertyId || f.id || propertyIdLocal,
          sourceUrl: parsed.sourceUrl || f.sourceUrl,
          empreendimento:
            f.empreendimento ||
            result.empreendimento?.trim() ||
            result.title?.trim() ||
            f.empreendimento,
          unidade: f.unidade || result.unidade?.trim() || f.unidade,
          title: f.title || result.title?.trim() || f.title,
          images: images.length > 0 ? images : f.images,
        }))
        const empName = result.empreendimento?.trim() || result.title?.trim()
        if (empName) {
          setEmpOptions((prev) =>
            Array.from(new Set([...prev, empName])).sort((a, b) =>
              a.localeCompare(b, 'pt-BR'),
            ),
          )
        }
        setChips((c) =>
          Array.from(new Set([...c, `Fotos DWV (${result.total_fotos ?? images.length})`])),
        )
        const falhas = result.falhas ?? 0
        const errHint = result.errors?.length ? ` Detalhe: ${result.errors[0]}` : ''
        const changeMsg =
          changes.length > 0 ? `${changes.length} alteração(ões). ` : ''
        setToast(
          falhas > 0
            ? `${changeMsg}${result.total_fotos ?? 0} fotos importadas (${falhas} falha(s)).${errHint}`
            : `${changeMsg}${result.total_fotos ?? images.length} fotos importadas da DWV. Revise e salve.`,
        )
      } catch (e) {
        if (e instanceof DwvDuplicateError) {
          await discardDraftAndOpenExisting(
            e.existingId,
            e.message,
            merged.id || uploadFolder,
          )
          return false
        }
        setToast(
          e instanceof Error
            ? `Dados aplicados, mas falha ao importar fotos: ${e.message}`
            : 'Dados aplicados, mas falha ao importar fotos da DWV.',
        )
      } finally {
        setBusyPhotos(false)
        setPhotoProgress(null)
      }
    } else if (isEdit) {
      const photosNote = alreadyHasPhotos
        ? ' Fotos já baixadas — mantidas (sem reimportar).'
        : ''
      if (changes.length === 0) {
        setToast(
          alreadyHasPhotos
            ? `Anúncio igual ao cadastro — nenhuma alteração.${photosNote}`
            : 'Anúncio igual ao cadastro — nenhuma alteração detectada.',
        )
      } else {
        setToast(
          `${changes.length} campo(s) atualizado(s): ${changes.map((c) => c.label).join(', ')}.${photosNote} Revise e salve.`,
        )
      }
    } else if (alreadyHasPhotos) {
      setToast(
        changes.length > 0
          ? `${changes.length} campo(s) definidos. Fotos já existentes mantidas.`
          : 'Dados aplicados. Fotos já existentes mantidas.',
      )
    } else {
      setToast(
        changes.length > 0
          ? `Preenchido · ${changes.length} campo(s) definidos. Revise e adicione as fotos.`
          : 'Preenchido automaticamente. Revise e adicione as fotos.',
      )
    }

    return true
  }

  const onPasteArea = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text')
    if (!text.trim()) return
    setTimeout(() => {
      setPaste(text)
      void applyText(text)
    }, 0)
  }

  const onPhotos = async (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) {
      setToast('Selecione arquivos de imagem (JPG, PNG…).')
      return
    }

    setBusyPhotos(true)
    setPhotoProgress(`Enviando 0/${list.length}…`)
    try {
      const imovelId = form.id.trim() || uploadFolder
      const uploaded = await uploadPropertyPhotos(imovelId, list, (done, total) => {
        setPhotoProgress(`Enviando ${done}/${total}…`)
      })
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }))
      setToast(
        `${uploaded.length} foto(s) no Storage (path relativo). A primeira é a capa.`,
      )
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Erro ao enviar fotos.')
    } finally {
      setBusyPhotos(false)
      setPhotoProgress(null)
    }
  }

  const removePhoto = (index: number) => {
    const asset = form.images[index]
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
    if (asset?.path) {
      void removePropertyPhoto(asset.path)
    }
  }

  const movePhoto = (index: number, dir: -1 | 1) => {
    setForm((f) => {
      const images = [...f.images]
      const j = index + dir
      if (j < 0 || j >= images.length) return f
      ;[images[index], images[j]] = [images[j], images[index]]
      return { ...f, images }
    })
  }

  const setAsCover = (index: number) => {
    if (index <= 0) return
    setForm((f) => {
      if (index >= f.images.length) return f
      const images = [...f.images]
      const [picked] = images.splice(index, 1)
      images.unshift(picked)
      return { ...f, images }
    })
    setToast('Capa atualizada. Salve para publicar a alteração.')
  }

  const checklist = useMemo(() => {
    const dados = Boolean(form.empreendimento && form.bedrooms && form.areaPrivate)
    const valores = Boolean(form.price)
    const local = Boolean(form.address || form.cityKey || form.lat)
    const fotos = form.images.length > 0
    return { dados, valores, local, fotos }
  }, [form])

  const step1Done = chips.length > 0 || Boolean(form.empreendimento && form.price)
  const step2Done = checklist.dados && checklist.valores
  const step3Done = checklist.fotos

  const save = async (status: 'rascunho' | 'pronto') => {
    const emp = form.empreendimento.trim()
    if (!emp) {
      setToast('Selecione ou cadastre o empreendimento.')
      return
    }
    if (!form.price.trim()) {
      setToast('Informe o valor.')
      return
    }
    if (status === 'pronto' && form.images.length === 0) {
      setToast('Adicione ao menos 1 foto para marcar como pronto.')
      return
    }

    setSaving(true)
    const now = new Date().toISOString()
    const unidade = distinctUnidade(emp, form.unidade) || ''
    const title = displayTitle(emp, unidade)
    const id = form.id.trim() || slugifyId(unidade ? `${emp}-${unidade}` : emp)
    const areaPrivate = Number(form.areaPrivate) || 0
    const cityKey = form.cityKey || 'Itapema'
    const city = form.city.trim() || cityKey
    const location = form.location.trim() || city

    const property: AdminProperty = {
      id,
      kind: form.kind,
      mode: form.mode,
      badge: form.badge.trim() || undefined,
      badgeVariant: form.badge ? 'gold' : undefined,
      location,
      city,
      cityKey,
      title,
      unitName: emp,
      empreendimento: emp,
      unidade: unidade || undefined,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      suites: form.suites ? Number(form.suites) : undefined,
      parking: Number(form.parking) || 0,
      area: areaPrivate,
      areaPrivate: areaPrivate || undefined,
      areaTotal: form.areaTotal ? Number(form.areaTotal) : undefined,
      price: form.price.trim(),
      priceValue: form.priceValue ? Number(form.priceValue) : undefined,
      entrada: form.entrada.trim() || undefined,
      reforco: form.reforco.trim() || undefined,
      parcelamento: form.parcelamento.trim() || undefined,
      unitFeatures: linesToList(form.unitFeaturesText),
      amenities: linesToList(form.amenitiesText),
      address: form.address.trim() || undefined,
      cep: form.cep.trim() || undefined,
      sourceUrl: form.sourceUrl.trim() || undefined,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
      coverPath: form.images[0]?.path,
      imageAssets: form.images,
      images: undefined,
      image: undefined,
      createdAt: createdAt ?? now,
      updatedAt: now,
      status,
    }

    try {
      await saveAdminPropertyDb(property)
      router.push('/admin/imoveis')
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.startsWith('DUPLICATE_DWV:')) {
        const [, existingId, existingTitle] = msg.split(':')
        await discardDraftAndOpenExisting(
          existingId,
          `Este imóvel já está cadastrado (“${existingTitle || existingId}”). Rascunho descartado.`,
          id,
        )
        return
      }
      setToast(
        e instanceof Error
          ? e.message
          : 'Erro ao salvar no Supabase. Verifique login e schema.',
      )
      setSaving(false)
    }
  }

  const field =
    'w-full border border-[#ddd7cc] bg-white px-3 py-2.5 text-[0.9rem] text-[#0b1420] outline-none focus:border-[#0e6b7a] focus:ring-1 focus:ring-[#0e6b7a]/25'
  const label =
    'block text-[0.65rem] font-semibold tracking-[.1em] uppercase text-[#7a818a] mb-1.5'

  if (!ready) {
    return <p className="text-[#6f7680]">Carregando…</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/imoveis"
          className="text-[0.7rem] font-semibold tracking-[.1em] uppercase text-[#0e6b7a] hover:opacity-80"
        >
          ← Imóveis
        </Link>
        <h1 className="mt-2 font-serif text-[1.7rem] sm:text-[1.9rem] text-[#0b1420]">
          {isEdit ? 'Editar imóvel' : 'Cadastrar imóvel'}
        </h1>
        {isEdit && form.id && (
          <p className="mt-1.5 text-[0.8rem] text-[#6f7680]">
            Página pública:{' '}
            <Link
              href={`/${form.mode === 'aluguel' ? 'aluguel' : 'vendas'}/${form.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0e6b7a] underline underline-offset-2"
            >
              /{form.mode === 'aluguel' ? 'aluguel' : 'vendas'}/{form.id}
            </Link>
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="bg-white border border-[#ebe8e2] px-4 py-3.5 flex flex-wrap gap-x-6 gap-y-3">
        <Step n={1} label="Colar anúncio" active={!step1Done} done={step1Done} />
        <Step n={2} label="Revisar dados" active={step1Done && !step2Done} done={step2Done} />
        <Step n={3} label="Fotos" active={step2Done && !step3Done} done={step3Done} />
      </div>

      {toast && (
        <div className="flex items-start justify-between gap-3 bg-[#e8f4f6] border border-[#c5e0e5] px-4 py-3 text-[0.88rem] text-[#0e6b7a]">
          <p>{toast}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[0.7rem] font-semibold uppercase tracking-wide opacity-70 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <div className="space-y-5">
          {/* 1. Paste */}
          <section className="bg-white border border-[#ebe8e2] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-[0.78rem] font-semibold tracking-[.12em] uppercase text-[#0b1420]">
                  1. Cole o anúncio
                </h2>
                <p className="mt-1 text-[0.82rem] text-[#6f7680]">
                  {isEdit
                    ? 'Cole de novo para corrigir — só o que mudou é atualizado. Fotos já baixadas não são reimportadas.'
                    : 'Ctrl+V aqui — preenche os campos e, se houver link DWV e ainda não houver fotos, importa automaticamente.'}
                </p>
              </div>
              {chips.length > 0 && (
                <span className="shrink-0 text-[0.65rem] font-semibold tracking-[.08em] uppercase text-[#1f6b4a] bg-[#e7f5ef] px-2 py-1">
                  {pasteChanges.length > 0
                    ? `${pasteChanges.length} alterado(s)`
                    : `${chips.length} campos`}
                </span>
              )}
            </div>
            <textarea
              ref={pasteRef}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              onPaste={onPasteArea}
              rows={6}
              placeholder={
                isEdit
                  ? 'Cole o anúncio atualizado para detectar e corrigir diferenças…'
                  : 'Cole aqui o texto do WhatsApp / DWV…'
              }
              className={`${field} font-mono text-[0.78rem] leading-relaxed min-h-[140px] bg-[#faf9f7]`}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void applyText(paste)}
                disabled={busyPhotos}
                className="min-h-[40px] px-4 bg-[#0e6b7a] text-white text-[0.68rem] font-semibold tracking-[.1em] uppercase hover:bg-[#095260] disabled:opacity-50"
              >
                {busyPhotos
                  ? photoProgress || 'Importando…'
                  : isEdit
                    ? 'Atualizar pelo anúncio'
                    : 'Preencher agora'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaste('')
                  setChips([])
                  setPasteChanges([])
                }}
                className="min-h-[40px] px-3 text-[0.68rem] font-semibold tracking-[.1em] uppercase text-[#6f7680] hover:text-[#0b1420]"
              >
                Limpar
              </button>
            </div>
            {pasteChanges.length > 0 && (
              <div className="mt-3 border border-[#e8d9a8] bg-[#fffbf0] px-3 py-2.5 space-y-1.5">
                <p className="text-[0.62rem] font-semibold tracking-[.1em] uppercase text-[#8a7040]">
                  Alterações detectadas
                </p>
                <ul className="space-y-1">
                  {pasteChanges.map((c) => (
                    <li key={c.label} className="text-[0.78rem] text-[#4a5560]">
                      <span className="font-medium text-[#0b1420]">{c.label}:</span>{' '}
                      <span className="text-[#9b3b3b] line-through decoration-[#9b3b3b]/40">
                        {c.from.length > 60 ? `${c.from.slice(0, 60)}…` : c.from}
                      </span>
                      <span className="mx-1.5 text-[#c9a35a]">→</span>
                      <span className="text-[#1f6b4a]">
                        {c.to.length > 60 ? `${c.to.slice(0, 60)}…` : c.to}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className={`text-[0.65rem] px-2 py-1 font-medium ${
                      c.startsWith('↻')
                        ? 'bg-[#fff4e0] text-[#8a7040]'
                        : 'bg-[#e8f4f6] text-[#0e6b7a]'
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* 2. Review */}
          <section className="bg-white border border-[#ebe8e2] p-4 sm:p-5 space-y-4">
            <h2 className="text-[0.78rem] font-semibold tracking-[.12em] uppercase text-[#0b1420]">
              2. Revisar dados
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <CreatableSelect
                label="Empreendimento"
                value={form.empreendimento}
                options={empOptions}
                placeholder="Selecione o empreendimento"
                onChange={onEmpreendimentoChange}
                hint="Lista dos já cadastrados + opção de novo"
              />
              <CreatableSelect
                label="Unidade"
                value={form.unidade}
                options={unitOptions}
                placeholder="Ex.: Apto 1201 / Torre A"
                onChange={onUnidadeChange}
                hint="Opcional — selecione ou cadastre"
              />
              <div>
                <label className={label}>Tipo</label>
                <select className={field} value={form.kind} onChange={set('kind')}>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                </select>
              </div>
              <div>
                <label className={label}>Finalidade</label>
                <select className={field} value={form.mode} onChange={set('mode')}>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </select>
              </div>
              <div>
                <label className={label}>CEP</label>
                <div className="relative">
                  <input
                    className={field}
                    value={form.cep}
                    onChange={onCepChange}
                    onBlur={() => {
                      if (isCompleteCep(form.cep)) void applyCep(form.cep)
                    }}
                    placeholder="88220-000"
                    inputMode="numeric"
                    maxLength={9}
                    autoComplete="postal-code"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold tracking-[.06em] uppercase text-[#7a818a]">
                    {cepStatus === 'loading' && 'Buscando…'}
                    {cepStatus === 'ok' && 'OK'}
                    {cepStatus === 'error' && 'Inválido'}
                  </span>
                </div>
              </div>
              <div>
                <label className={label}>Cidade</label>
                <select className={field} value={form.cityKey} onChange={set('cityKey')}>
                  {CITY_FILTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Localização</label>
                <input className={field} value={form.location} onChange={set('location')} />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Endereço</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className={`${field} flex-1`}
                    value={form.address}
                    onChange={set('address')}
                    placeholder="Rua, número, cidade/SC"
                  />
                  <button
                    type="button"
                    onClick={() => void applyGeocode(form.address)}
                    disabled={geoStatus === 'loading' || form.address.trim().length < 5}
                    className="min-h-[42px] px-4 shrink-0 border border-[#d8d2c8] bg-white text-[0.68rem] font-semibold tracking-[.1em] uppercase text-[#0b1420] hover:bg-[#faf9f7] disabled:opacity-50"
                  >
                    {geoStatus === 'loading' ? 'Buscando…' : 'Identificar'}
                  </button>
                </div>
                <p className="mt-1.5 text-[0.72rem] text-[#9aa0a6]">
                  Sem CEP no anúncio? Clique em Identificar — usamos o texto do endereço para
                  achar cidade e mapa.
                  {geoStatus === 'ok' && form.lat ? ' · Mapa OK' : ''}
                  {geoStatus === 'error' ? ' · Não encontrado' : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(
                [
                  ['bedrooms', 'Dorms'],
                  ['bathrooms', 'Banheiros'],
                  ['suites', 'Suítes'],
                  ['parking', 'Vagas'],
                  ['areaPrivate', 'Área m²'],
                  ['areaTotal', 'Total m²'],
                ] as const
              ).map(([key, lab]) => (
                <div key={key}>
                  <label className={label}>{lab}</label>
                  <input className={field} inputMode="decimal" value={form[key]} onChange={set(key)} />
                </div>
              ))}
            </div>

            <div className="border-t border-[#ebe8e2] pt-4 grid sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Valor</label>
                <input className={field} value={form.price} onChange={set('price')} />
              </div>
              <div>
                <label className={label}>Entrada</label>
                <input className={field} value={form.entrada} onChange={set('entrada')} />
              </div>
              <div>
                <label className={label}>Reforço</label>
                <input className={field} value={form.reforco} onChange={set('reforco')} />
              </div>
              <div>
                <label className={label}>Parcelamento</label>
                <input className={field} value={form.parcelamento} onChange={set('parcelamento')} />
              </div>
            </div>

            <details className="border border-[#ebe8e2] open:bg-[#faf9f7]">
              <summary className="cursor-pointer px-3 py-2.5 text-[0.72rem] font-semibold tracking-[.1em] uppercase text-[#4a5560]">
                Itens da unidade e do empreendimento
              </summary>
              <div className="p-3 grid sm:grid-cols-2 gap-3 border-t border-[#ebe8e2]">
                <div>
                  <label className={label}>Unidade</label>
                  <textarea
                    className={field}
                    rows={8}
                    value={form.unitFeaturesText}
                    onChange={set('unitFeaturesText')}
                  />
                </div>
                <div>
                  <label className={label}>Empreendimento</label>
                  <textarea
                    className={field}
                    rows={8}
                    value={form.amenitiesText}
                    onChange={set('amenitiesText')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Link DWV</label>
                  <input className={field} value={form.sourceUrl} onChange={set('sourceUrl')} />
                  {form.sourceUrl.includes('dwvapp.com.br') && (
                    <button
                      type="button"
                      disabled={busyPhotos}
                      onClick={() => {
                        void (async () => {
                          setBusyPhotos(true)
                          setPhotoProgress('Importando fotos da DWV…')
                          try {
                            const result = await importDwvGallery({
                              galleryUrl: form.sourceUrl,
                              propertyId: form.id.trim() || uploadFolder,
                              replacePhotos: true,
                              onProgress: (done, total) => {
                                setPhotoProgress(`Importando fotos DWV ${done}/${total}…`)
                              },
                            })
                            const images = result.images ?? []
                            setForm((f) => ({
                              ...f,
                              images: images.length > 0 ? images : f.images,
                            }))
                            setToast(
                              `${result.total_fotos ?? images.length} fotos importadas da DWV.`,
                            )
                          } catch (e) {
                            if (e instanceof DwvDuplicateError) {
                              await discardDraftAndOpenExisting(
                                e.existingId,
                                e.message,
                                form.id || uploadFolder,
                              )
                              return
                            }
                            setToast(
                              e instanceof Error ? e.message : 'Falha ao importar fotos DWV.',
                            )
                          } finally {
                            setBusyPhotos(false)
                            setPhotoProgress(null)
                          }
                        })()
                      }}
                      className="mt-2 min-h-[36px] px-3 text-[0.65rem] font-semibold tracking-[.1em] uppercase bg-[#e8f4f6] text-[#0e6b7a] hover:bg-[#d5eef2] disabled:opacity-50"
                    >
                      {form.images.length > 0
                        ? 'Reimportar fotos (substitui as atuais)'
                        : 'Importar fotos deste link'}
                    </button>
                  )}
                </div>
              </div>
            </details>
          </section>

          <section className="bg-white border border-[#ebe8e2] p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-[0.78rem] font-semibold tracking-[.12em] uppercase text-[#0b1420]">
                  3. Fotos (path relativo)
                </h2>
                <p className="mt-1 text-[0.82rem] text-[#6f7680]">
                  Clique em “Usar como capa” em qualquer foto. A primeira da lista é a capa do
                  anúncio.
                </p>
              </div>
              <label className="inline-flex min-h-[42px] cursor-pointer items-center px-4 bg-[#0b1420] text-white text-[0.68rem] font-semibold tracking-[.1em] uppercase hover:bg-[#162033]">
                {busyPhotos ? photoProgress || 'Enviando…' : 'Enviar fotos'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  multiple
                  className="hidden"
                  disabled={busyPhotos}
                  onChange={(e) => {
                    void onPhotos(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>

            {photoProgress && (
              <p className="text-[0.82rem] text-[#0e6b7a] bg-[#e8f4f6] border border-[#c5e0e5] px-3 py-2">
                {photoProgress}
              </p>
            )}

            {form.images.length === 0 ? (
              <label className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-[#d0cbc2] cursor-pointer hover:bg-[#faf9f7] transition-colors">
                <span className="text-[0.9rem] text-[#4a5560]">
                  Clique para enviar fotos ao Supabase
                </span>
                <span className="text-[0.72rem] text-[#9aa0a6]">
                  JPG, PNG ou WebP · várias de uma vez · comprimidas automaticamente
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  multiple
                  className="hidden"
                  disabled={busyPhotos}
                  onChange={(e) => {
                    void onPhotos(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {form.images.map((asset, i) => (
                  <li key={`${asset.path}-${i}`} className="relative group border border-[#ebe8e2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={storageUrl(asset.path)}
                      alt=""
                      width={asset.width || undefined}
                      height={asset.height || undefined}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {i === 0 ? (
                      <span className="absolute top-1.5 left-1.5 text-[0.55rem] font-semibold tracking-[.1em] uppercase bg-[#0e6b7a] text-white px-1.5 py-0.5">
                        Capa
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsCover(i)}
                        className="absolute top-1.5 left-1.5 text-[0.55rem] font-semibold tracking-[.08em] uppercase bg-white/95 text-[#0b1420] px-1.5 py-0.5 hover:bg-[#0e6b7a] hover:text-white transition-colors"
                      >
                        Usar como capa
                      </button>
                    )}
                    <div className="absolute inset-x-0 top-1.5 right-1.5 flex justify-end pointer-events-none">
                      <span className="text-[0.5rem] bg-[#0b1420]/75 text-white px-1 py-0.5 max-w-[55%] truncate">
                        {asset.width}×{asset.height} · {Math.round(asset.sizeBytes / 1024)}kb
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex bg-[#0b1420]/80">
                      <button
                        type="button"
                        onClick={() => movePhoto(i, -1)}
                        className="flex-1 py-1.5 text-white text-[0.65rem]"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(i, 1)}
                        className="flex-1 py-1.5 text-white text-[0.65rem]"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="flex-1 py-1.5 text-[#ffb4b4] text-[0.65rem]"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Live preview / checklist */}
        <aside className="lg:sticky lg:top-[72px] space-y-4">
          <div className="bg-white border border-[#ebe8e2] overflow-hidden">
            <div className="aspect-[4/3] bg-[#ece9e3] relative">
              {form.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storageUrl(form.images[0].path)}
                  alt=""
                  width={form.images[0].width || undefined}
                  height={form.images[0].height || undefined}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[0.8rem] text-[#9aa0a6]">
                  Prévia da capa
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-[0.62rem] font-semibold tracking-[.12em] uppercase text-[#0e6b7a] mb-1">
                {form.cityKey || 'Cidade'} · {form.kind === 'casa' ? 'Casa' : 'Apartamento'}
              </p>
              <h3 className="font-serif text-[1.2rem] text-[#0b1420] leading-snug">
                {displayTitle(form.empreendimento, form.unidade) || 'Nome do imóvel'}
              </h3>
              <p className="mt-2 text-[1.05rem] font-semibold text-[#0b1420]">
                {form.price || 'R$ —'}
              </p>
              <p className="mt-2 text-[0.8rem] text-[#6f7680]">
                {[
                  form.bedrooms && `${form.bedrooms} dorm.`,
                  form.suites && `${form.suites} suítes`,
                  form.parking && `${form.parking} vagas`,
                  form.areaPrivate && `${form.areaPrivate} m²`,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Detalhes aparecem aqui'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#ebe8e2] p-4 space-y-2.5">
            <p className="text-[0.65rem] font-semibold tracking-[.12em] uppercase text-[#7a818a] mb-1">
              Checklist
            </p>
            {(
              [
                ['dados', 'Empreendimento + dorms/área'],
                ['valores', 'Valor preenchido'],
                ['local', 'Cidade / endereço'],
                ['fotos', 'Pelo menos 1 foto'],
              ] as const
            ).map(([key, text]) => (
              <div key={key} className="flex items-center gap-2 text-[0.84rem]">
                <span
                  className={`w-5 h-5 rounded-full text-[0.65rem] flex items-center justify-center ${
                    checklist[key]
                      ? 'bg-[#1f6b4a] text-white'
                      : 'bg-[#ebe8e2] text-[#9aa0a6]'
                  }`}
                >
                  {checklist[key] ? '✓' : ''}
                </span>
                <span className={checklist[key] ? 'text-[#0b1420]' : 'text-[#8a9098]'}>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save('pronto')}
              className="min-h-[46px] bg-[#0e6b7a] text-white text-[0.72rem] font-semibold tracking-[.1em] uppercase hover:bg-[#095260] disabled:opacity-50"
            >
              Salvar imóvel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save('rascunho')}
              className="min-h-[42px] border border-[#d8d2c8] bg-white text-[0.7rem] font-semibold tracking-[.1em] uppercase text-[#4a5560] hover:bg-[#faf9f7] disabled:opacity-50"
            >
              Só rascunho
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
