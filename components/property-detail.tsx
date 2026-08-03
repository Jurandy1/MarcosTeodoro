import Link from 'next/link'
import { PropertyGallery } from '@/components/property-gallery'
import { PropertyCard } from '@/components/property-card'
import { buildMediaItems, mapsEmbedUrl, mapsExternalUrl } from '@/lib/property-images'
import { type CatalogProperty, type PropertyMode } from '@/lib/properties'
import {
  propertyAbsoluteUrl,
  propertyPublicPath,
  resolvePropertyTitle,
} from '@/lib/property-title'

export function PropertyDetailView({
  property,
  mode,
  similar = [],
}: {
  property: CatalogProperty
  mode: PropertyMode
  similar?: CatalogProperty[]
}) {
  const basePath = mode === 'venda' ? '/vendas' : '/aluguel'
  const kindLabel = property.kind === 'apartamento' ? 'Apartamentos' : 'Casas'
  const title = resolvePropertyTitle(property)
  const propertyUrl = propertyAbsoluteUrl(property.id, mode)
  const media = buildMediaItems({
    id: property.id,
    images: property.images,
    cover: property.coverPath || property.image,
    imageAssets: property.imageAssets,
    videos: property.videos,
    fakeCount: 0,
  })

  const mapEmbed = mapsEmbedUrl({
    lat: property.lat,
    lng: property.lng,
    address: property.address,
  })
  const mapLink = mapsExternalUrl({
    lat: property.lat,
    lng: property.lng,
    address: property.address,
  })

  const whatsappHref = `https://wa.me/5547991594019?text=${encodeURIComponent(
    `Olá Marcos, tenho interesse no imóvel ${title} (cód. ${property.id}).\n${property.city}\n${property.price}\n${propertyUrl}`,
  )}`

  const areaPrivate =
    property.areaPrivate ?? (typeof property.area === 'number' ? property.area : null)
  const areaTotal = property.areaTotal ?? null

  return (
    <div className="bg-white text-[#2a3541]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-14 sm:pb-20">
        <nav className="text-[12px] text-[#8a9098] mb-4 sm:mb-5 flex flex-wrap items-center gap-1.5">
          <Link href={basePath} className="hover:text-[#0e6b7a]">
            {mode === 'venda' ? 'Imóveis à Venda' : 'Imóveis para Alugar'}
          </Link>
          <span className="text-[#c9c9c9]">›</span>
          <Link href={`${basePath}?tipo=${property.kind}`} className="hover:text-[#0e6b7a]">
            {kindLabel}
          </Link>
          <span className="text-[#c9c9c9]">›</span>
          <span className="text-[#4a5560]">{property.cityKey}</span>
        </nav>

        <header className="mb-5 sm:mb-6 max-w-[820px]">
          <h1 className="text-[1.5rem] sm:text-[1.85rem] lg:text-[2rem] font-semibold text-[#111827] leading-[1.25] tracking-[-0.01em]">
            {title}
            {property.badge ? ` — ${property.badge}` : ''}
          </h1>
          <p className="mt-2 text-[13px] sm:text-[14px] text-[#6b7280]">
            Cód. {property.id}
            <span className="mx-2 text-[#d1d5db]">|</span>
            {property.location}
          </p>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-5 lg:gap-7 items-start mb-12 lg:mb-16">
          <PropertyGallery media={media} title={title} />

          <aside className="border border-[#e5e7eb] bg-white">
            <div className="p-5 sm:p-6">
              <p className="text-[13px] text-[#6b7280] mb-1">{property.city}</p>
              {property.badge && (
                <span className="inline-block mb-4 text-[10px] font-semibold tracking-[0.12em] uppercase bg-[#111827] text-white px-2.5 py-1">
                  {property.badge}
                </span>
              )}

              <ul className="space-y-3 text-[14px] text-[#374151] mb-6">
                <li className="flex items-center gap-3">
                  <SpecSvg type="bed" />
                  <span>
                    <strong className="font-semibold text-[#111827]">{property.bedrooms}</strong>{' '}
                    dormitórios
                    {property.suites != null ? ` · ${property.suites} suítes` : ''}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <SpecSvg type="bath" />
                  <span>
                    <strong className="font-semibold text-[#111827]">{property.bathrooms}</strong>{' '}
                    banheiros
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <SpecSvg type="car" />
                  <span>
                    <strong className="font-semibold text-[#111827]">{property.parking}</strong> vagas
                  </span>
                </li>
                {areaPrivate != null && (
                  <li className="flex items-center gap-3">
                    <SpecSvg type="area" />
                    <span>
                      Área privativa:{' '}
                      <strong className="font-semibold text-[#111827]">{areaPrivate} m²</strong>
                    </span>
                  </li>
                )}
                {areaTotal != null && (
                  <li className="flex items-center gap-3">
                    <SpecSvg type="area" />
                    <span>
                      Área total:{' '}
                      <strong className="font-semibold text-[#111827]">{areaTotal} m²</strong>
                    </span>
                  </li>
                )}
              </ul>

              <div className="border-t border-[#e5e7eb] pt-5 mb-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#9ca3af] mb-1">Valor</p>
                <p className="text-[1.35rem] font-semibold text-[#111827] leading-none">
                  {property.price}
                </p>
                {property.entrada && (
                  <p className="mt-2 text-[13px] text-[#6b7280]">Entrada: {property.entrada}</p>
                )}
                {property.reforco && (
                  <p className="text-[13px] text-[#6b7280]">Reforço: {property.reforco}</p>
                )}
                {property.parcelamento && (
                  <p className="text-[13px] text-[#6b7280]">Parcelas: {property.parcelamento}</p>
                )}
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full min-h-[48px] bg-[#25d366] text-white text-[13px] font-semibold tracking-[0.04em] hover:brightness-95 transition"
              >
                Mais informações via WhatsApp
              </a>
            </div>

            <div className="border-t border-[#e5e7eb] p-5 sm:p-6 bg-[#fafafa]">
              <p className="text-[14px] font-medium text-[#111827] mb-1">
                Quer saber mais sobre este imóvel?
              </p>
              <p className="text-[13px] text-[#6b7280] mb-4 leading-relaxed">
                Fale com Marcos Teodoro e receba detalhes, disponibilidade e visita.
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full min-h-[44px] bg-[#111827] text-white text-[12px] font-semibold tracking-[0.1em] uppercase hover:bg-[#1f2937] transition"
              >
                Solicitar atendimento
              </a>
            </div>
          </aside>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-7">
          <div className="max-w-[720px]">
            <section className="mb-10">
              <h2 className="text-[15px] font-semibold text-[#111827] mb-3">Sobre o imóvel</h2>
              <p className="text-[15px] leading-[1.7] text-[#4b5563]">
                {property.kind === 'apartamento' ? 'Apartamento' : 'Casa'} em {property.city}
                {areaPrivate != null ? `, com ${areaPrivate} m² de área privativa` : ''}
                {areaTotal != null ? ` e ${areaTotal} m² de área total` : ''}.{' '}
                {property.bedrooms} dormitórios
                {property.suites != null ? ` (${property.suites} suítes)` : ''},{' '}
                {property.bathrooms} banheiros e {property.parking} vaga
                {Number(property.parking) === 1 ? '' : 's'}.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[15px] font-semibold text-[#111827] mb-4">
                Metragem e configuração
              </h2>
              <table className="w-full text-[14px] border-collapse">
                <tbody>
                  <Row label="Unidade" value={title} />
                  {areaPrivate != null && <Row label="Área privativa" value={`${areaPrivate} m²`} />}
                  {areaTotal != null && <Row label="Área total" value={`${areaTotal} m²`} />}
                  <Row label="Dormitórios" value={String(property.bedrooms)} />
                  <Row label="Banheiros" value={String(property.bathrooms)} />
                  {property.suites != null && <Row label="Suítes" value={String(property.suites)} />}
                  <Row label="Vagas de garagem" value={String(property.parking)} />
                </tbody>
              </table>
            </section>

            {(property.unitFeatures?.length || property.amenities?.length) && (
              <section className="mb-10">
                <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
                  {property.unitFeatures && property.unitFeatures.length > 0 && (
                    <div>
                      <h2 className="text-[15px] font-semibold text-[#111827] mb-4">
                        Características do imóvel
                      </h2>
                      <BulletList items={property.unitFeatures} />
                    </div>
                  )}
                  {property.amenities && property.amenities.length > 0 && (
                    <div>
                      <h2 className="text-[15px] font-semibold text-[#111827] mb-4">
                        Características do empreendimento
                      </h2>
                      <BulletList items={property.amenities} />
                    </div>
                  )}
                </div>
              </section>
            )}

            {(property.address || mapEmbed) && (
              <section className="mb-4">
                <div className="flex items-end justify-between gap-3 mb-3">
                  <h2 className="text-[15px] font-semibold text-[#111827]">Localização</h2>
                  {mapLink && (
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-semibold tracking-[0.06em] uppercase text-[#0e6b7a] hover:text-[#095260]"
                    >
                      Abrir no Maps
                    </a>
                  )}
                </div>
                {property.address && (
                  <p className="text-[15px] text-[#4b5563] mb-4">{property.address}</p>
                )}
                {mapEmbed && (
                  <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] overflow-hidden border border-[#e5e7eb] bg-[#f3f4f6]">
                    <iframe
                      title={`Mapa — ${title}`}
                      src={mapEmbed}
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="hidden lg:block" aria-hidden />
        </div>

        {similar.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#e5e7eb]">
            <h2 className="text-[1.25rem] font-semibold text-[#111827] mb-6">Imóveis semelhantes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} href={propertyPublicPath(p.id, p.mode)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-[#f0f0f0]">
      <td className="py-3 pr-4 text-[#6b7280] w-[42%]">{label}</td>
      <td className="py-3 text-[#111827] font-medium">{value}</td>
    </tr>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[14px] text-[#4b5563]">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="text-[#0e6b7a] select-none">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SpecSvg({ type }: { type: 'bed' | 'bath' | 'car' | 'area' }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#6b7280',
    strokeWidth: 1.6,
    'aria-hidden': true as const,
  }
  if (type === 'bed') {
    return (
      <svg {...common}>
        <path d="M3 12h18v5H3zM3 12V8h9v4M14 9h5a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'bath') {
    return (
      <svg {...common}>
        <path d="M5 12h14v2a3 3 0 01-3 3H8a3 3 0 01-3-3v-2zM7 12V7a2 2 0 012-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'car') {
    return (
      <svg {...common}>
        <path d="M4 13l2-4h12l2 4M4 13h16v3H4z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7.5" cy="16.5" r="0.8" fill="#6b7280" stroke="none" />
        <circle cx="16.5" cy="16.5" r="0.8" fill="#6b7280" stroke="none" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 10h16M10 4v16" />
    </svg>
  )
}
