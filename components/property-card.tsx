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

export function PropertyCard({ property, href = '#' }: { property: Property; href?: string }) {
  const imageSrc = getFakePropertyImage(property.id, property.image)

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
            <div className="absolute top-3 left-3 z-10 text-[0.55rem] font-semibold tracking-[.12em] uppercase px-2.5 py-1 rounded-md bg-white/95 text-[#0b1420] shadow-sm">
              {property.badge}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 min-w-0">
        <div className="text-[0.62rem] font-medium tracking-[.08em] uppercase text-[#6f7680] mb-1.5 truncate">
          {property.city}
        </div>

        <h3
          className="text-[0.98rem] font-normal text-[#1a2432] mb-3 leading-snug line-clamp-2 min-h-[2.6em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
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
            {typeof property.area === 'number' || /^\d+$/.test(String(property.area)) ? (
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
