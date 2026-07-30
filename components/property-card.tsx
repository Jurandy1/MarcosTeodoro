import Link from 'next/link'

export interface Property {
  id: string
  badge?: string
  badgeVariant?: 'dark' | 'ocean' | 'gold'
  gradientClass?: string
  location: string
  city: string
  title: string
  bedrooms: number | string
  bathrooms: number | string
  parking: number | string
  area: number | string
  price: string
  priceOld?: string
}

const gradients: Record<string, string> = {
  g1: 'linear-gradient(150deg,#1e4a52,#3f7a80 60%,#79a8ac)',
  g2: 'linear-gradient(150deg,#25404f,#4d6b7d 60%,#8ea4b3)',
  g3: 'linear-gradient(150deg,#4a3f2e,#8a7757 60%,#c9b48b)',
  g4: 'linear-gradient(150deg,#2a3a55,#5a6a85 60%,#93a2bc)',
  g5: 'linear-gradient(150deg,#2d4a36,#4f7a58 60%,#8aa897)',
}

export function PropertyCard({ property, href = '#' }: { property: Property; href?: string }) {
  const grad = gradients[property.gradientClass ?? 'g1'] ?? gradients.g1

  const badgeStyle =
    property.badgeVariant === 'gold'
      ? { background: '#c9a35a', color: '#0b1420' }
      : property.badgeVariant === 'ocean'
      ? { background: '#0e6b7a', color: '#fff' }
      : { background: 'rgba(11,20,32,.85)', color: '#fff' }

  return (
    <article className="bg-white border border-[#e6e2da] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(11,20,32,.12)] hover:border-transparent group">
      <Link href={href} className="block">
        {/* Imagem / placeholder */}
        <div
          className="relative aspect-[16/11] overflow-hidden"
          style={{ background: grad }}
          aria-hidden="true"
        >
          {/* Padrão de textura sutil */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 2px,transparent 2px 14px)',
            }}
          />
          {/* Badge */}
          {property.badge && (
            <div
              className="absolute top-3 left-3 z-10 text-[0.56rem] font-bold tracking-[.14em] uppercase px-3 py-1.5 rounded-full backdrop-blur-sm"
              style={badgeStyle}
            >
              {property.badge}
            </div>
          )}
          {/* Favoritar */}
          <button
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#7a7d82] hover:text-[#0e6b7a] transition-colors cursor-pointer"
            aria-label="Favoritar imóvel"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
          {/* Placeholder label */}
          <div className="absolute bottom-2.5 left-0 right-0 text-center text-[0.5rem] tracking-[.28em] text-white/40 uppercase">
            foto do imóvel
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 min-w-0">
        {/* Localização */}
        <div className="flex justify-between items-baseline gap-2 text-[0.58rem] sm:text-[0.6rem] font-bold tracking-[.08em] sm:tracking-[.1em] uppercase text-[#4a5560] mb-1">
          <span className="flex items-center gap-1 min-w-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0e6b7a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{property.city}</span>
          </span>
          <span className="text-[#adb0b5] font-medium tracking-[.02em] shrink-0">#{property.id}</span>
        </div>

        {/* Título */}
        <h3
          className="text-[0.95rem] sm:text-[1rem] font-normal text-[#1a2432] mb-3 leading-snug min-h-[2.6em] sm:min-h-[2.8em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {property.title}
        </h3>

        {/* Atributos */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[0.68rem] sm:text-[0.7rem] text-[#7a7d82] border-t border-[#e6e2da] pt-2.5 mt-auto">
          <span className="flex items-center gap-1">
            <BedIcon />
            <b className="text-[#33353a] font-semibold">{property.bedrooms}</b>
          </span>
          <span className="flex items-center gap-1">
            <BathIcon />
            <b className="text-[#33353a] font-semibold">{property.bathrooms}</b>
          </span>
          <span className="flex items-center gap-1">
            <CarIcon />
            <b className="text-[#33353a] font-semibold">{property.parking}</b>
          </span>
          <span className="flex items-center gap-1">
            <AreaIcon />
            <b className="text-[#33353a] font-semibold">{property.area}</b> m²
          </span>
        </div>

        {/* Preço */}
        <div className="mt-2.5 text-[0.98rem] sm:text-[1.05rem] font-bold text-[#0b1420] break-words">
          {property.priceOld && (
            <s className="text-[0.68rem] text-[#b3b6ba] font-medium mr-1.5">{property.priceOld}</s>
          )}
          {property.price}
        </div>
      </div>
    </article>
  )
}

function BedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M2 18h20" />
    </svg>
  )
}

function BathIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}

function AreaIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}
