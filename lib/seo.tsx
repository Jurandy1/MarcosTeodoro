import type { Metadata } from 'next'
import type { CatalogProperty } from '@/lib/properties'
import {
  getPublicSiteSettings,
  SITE_URL,
  type PublicSiteSettings,
} from '@/lib/site-settings'
import { resolvePropertyTitle } from '@/lib/property-title'
import { propertyPublicPath } from '@/lib/property-title'
import { storageUrl } from '@/lib/storage'

export async function buildRootMetadata(): Promise<Metadata> {
  const s = await getPublicSiteSettings()
  return {
    metadataBase: new URL(SITE_URL),
    title: s.seoTitle,
    description: s.seoDescription,
    keywords: s.seoKeywords,
    alternates: { canonical: '/' },
    openGraph: {
      title: s.seoTitle,
      description: s.seoDescription,
      locale: 'pt_BR',
      type: 'website',
      url: '/',
      siteName: s.companyName,
      images: [{ url: s.ogImageUrl, width: 1200, height: 630, alt: s.companyName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: s.seoTitle,
      description: s.seoDescription,
      images: [s.ogImageUrl],
    },
    robots: { index: true, follow: true },
  }
}

export function buildPropertyMetadata(
  property: CatalogProperty,
  mode: 'venda' | 'aluguel',
): Metadata {
  const title = resolvePropertyTitle(property)
  const path = propertyPublicPath(property.id, mode)
  const descParts = [
    property.city || property.cityKey,
    property.bedrooms ? `${property.bedrooms} dorm` : null,
    property.areaPrivate || property.area
      ? `${property.areaPrivate || property.area} m²`
      : null,
    property.price,
  ].filter(Boolean)
  const description =
    property.description?.trim() ||
    `${title} em ${descParts.join(' · ')}. Imóvel com Marcos Teodoro.`
  const image =
    property.image ||
    (property.coverPath ? storageUrl(property.coverPath) : undefined) ||
    property.images?.[0]

  return {
    title: `${title} | Marcos Teodoro`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: 'article',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export function agentJsonLd(s: PublicSiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: s.companyName,
    description: s.seoDescription,
    url: SITE_URL,
    image: s.ogImageUrl.startsWith('http') ? s.ogImageUrl : `${SITE_URL}${s.ogImageUrl}`,
    telephone: s.phone,
    email: s.email || undefined,
    address: s.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: s.address,
          addressCountry: 'BR',
        }
      : undefined,
    areaServed: ['Balneário Camboriú', 'Itapema', 'Porto Belo', 'Bombinhas'],
    sameAs: [instagramUrlSafe(s.instagram)].filter(Boolean),
  }
}

function instagramUrlSafe(raw: string) {
  if (!raw) return undefined
  if (raw.startsWith('http')) return raw
  return `https://www.instagram.com/${raw.replace(/^@/, '')}/`
}

export function listingJsonLd(property: CatalogProperty, mode: 'venda' | 'aluguel') {
  const title = resolvePropertyTitle(property)
  const path = propertyPublicPath(property.id, mode)
  const url = `${SITE_URL}${path}`
  const image =
    property.image ||
    (property.coverPath ? storageUrl(property.coverPath) : undefined) ||
    property.images?.[0]
  const priceValue = property.priceValue

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description:
      property.description?.trim() ||
      `${title} em ${property.city || property.cityKey}. ${property.bedrooms} dormitórios.`,
    url,
    image: image ? [image] : undefined,
    datePosted: property.createdAt || undefined,
    offers: {
      '@type': 'Offer',
      price: priceValue && priceValue > 0 ? priceValue : undefined,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url,
      businessFunction:
        mode === 'aluguel'
          ? 'https://schema.org/LeaseOut'
          : 'https://schema.org/Sell',
    },
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    floorSize:
      property.areaPrivate || property.area
        ? {
            '@type': 'QuantitativeValue',
            value: property.areaPrivate || property.area,
            unitCode: 'MTK',
          }
        : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city || property.cityKey,
      streetAddress: property.address || undefined,
      postalCode: property.cep || undefined,
      addressRegion: 'SC',
      addressCountry: 'BR',
    },
  }
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
