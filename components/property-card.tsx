import Image from 'next/image'
import Link from 'next/link'
import { getFakePropertyImage } from '@/lib/property-images'

export interface Property {
  id: string
  badge?: string
  badgeVariant?: 'dark' | 'ocean' | 'gold'
  gradientClass?: string
  image?: string
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

export function PropertyCard({
  property,
  href = '#',
  compact = false,
}: {
  property: Property
  href?: string
  compact?: boolean
}) {
  const imageSrc = getFakePropertyImage(property.id, property.image)
  const areaIsNumber =
    typeof property.area === 'number' || /^\d+$/.test(String(property.area))

  if (compact) {
    return (
      <article className="bg-white rounded-xl overflow-hidden flex flex-col h-full border border-[#ebe8e2] shadow-[0_2px_8px_rgba(11,20,32,.04)] group hover:shadow-[0_10px_28px_rgba(11,20,32,.1)] transition-shadow duration-300">
        <Link href={href} className="block relative">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#ece9e3]">
            <Image
              src={imageSrc}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 300px"
            />
            {property.badge && (
              <div className="absolute top-2.5 left-2.5 z-10 text-[0.62rem] sm:text-[0.55rem] font-semibold tracking-[.1em] uppercase px-2 py-1 rounded-md bg-white/95 text-[#0b1420]">
                {property.badge}
              </div>
            )}
          </div>
        </Link>
        <div className="px-3.5 py-3 flex flex-col flex-1 min-w-0">
          <div className="text-[0.65rem] sm:text-[0.58rem] font-medium tracking-[.08em] uppercase text-[#8a9098] truncate mb-1">
            {property.city}
          </div>
          <h3 className="font-serif text-[0.95rem] text-[#1a2432] leading-snug line-clamp-2 min-h-[2.5em] mb-2.5">
            <Link href={href} className="hover:text-[#0e6b7a] transition-colors">
              {property.title}
            </Link>
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] text-[#6f7680] border-t border-[#f0ede8] pt-2.5 mb-2.5">
            <span>
              <b className="text-[#2a3541] font-semibold">{property.bedrooms}</b> dorm
            </span>
            <span>
              <b className="text-[#2a3541] font-semibold">{property.bathrooms}</b> ban
            </span>
            <span>
              <b className="text-[#2a3541] font-semibold">{property.parking}</b> vagas
            </span>
            {areaIsNumber ? (
              <span>
                <b className="text-[#2a3541] font-semibold">{property.area}</b> m²
              </span>
            ) : null}
          </div>
          <div className="mt-auto text-[1.02rem] font-semibold text-[#0b1420] tracking-tight">
            {property.price}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(11,20,32,.08)] group">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e6e1]">
          <Image
            src={imageSrc}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {property.badge && (
            <div className="absolute top-3 left-3 z-10 text-[0.62rem] sm:text-[0.55rem] font-semibold tracking-[.12em] uppercase px-2.5 py-1 rounded-md bg-white/95 text-[#0b1420] shadow-sm">
              {property.badge}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 min-w-0">
        <div className="text-[0.68rem] sm:text-[0.62rem] font-medium tracking-[.08em] uppercase text-[#6f7680] mb-1.5 truncate">
          {property.city}
        </div>

        <h3 className="font-serif text-[0.98rem] font-normal text-[#1a2432] mb-3 leading-snug line-clamp-2 min-h-[2.6em]">
          <Link href={href} className="hover:text-[#0e6b7a] transition-colors">
            {property.title}
          </Link>
        </h3>

        <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[0.72rem] text-[#6f7680] border-t border-[#eeebe6] pt-3 mt-auto">
          <span>
            <b className="text-[#2a3541] font-semibold">{property.bedrooms}</b> dorm
          </span>
          <span>
            <b className="text-[#2a3541] font-semibold">{property.bathrooms}</b> ban
          </span>
          <span>
            <b className="text-[#2a3541] font-semibold">{property.parking}</b> vagas
          </span>
          <span>
            {areaIsNumber ? (
              <>
                <b className="text-[#2a3541] font-semibold">{property.area}</b> m²
              </>
            ) : (
              <b className="text-[#2a3541] font-semibold">{property.area}</b>
            )}
          </span>
        </div>

        <div className="mt-3 text-[1.05rem] font-semibold text-[#0b1420] tracking-tight">
          {property.priceOld && (
            <s className="text-[0.68rem] text-[#b3b6ba] font-medium mr-1.5">{property.priceOld}</s>
          )}
          {property.price}
        </div>
      </div>
    </article>
  )
}
