/** Imagens fake (Unsplash) para portfólio até as fotos reais chegarem */
export const FAKE_PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d367e6?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80',
]

function hashId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % 997
  return hash
}

export function getFakePropertyImage(id: string, explicit?: string) {
  if (explicit) return explicit
  return FAKE_PROPERTY_IMAGES[hashId(id) % FAKE_PROPERTY_IMAGES.length]
}

/** Monta galeria: usa fotos reais se houver; senão gera N imagens fake estáveis por id */
export function getPropertyGallery(
  id: string,
  images?: string[],
  cover?: string,
  count = 12,
) {
  if (images && images.length > 0) {
    const list = cover && !images.includes(cover) ? [cover, ...images] : [...images]
    return list
  }

  const start = hashId(id) % FAKE_PROPERTY_IMAGES.length
  const gallery: string[] = []
  for (let i = 0; i < count; i++) {
    gallery.push(FAKE_PROPERTY_IMAGES[(start + i) % FAKE_PROPERTY_IMAGES.length])
  }
  if (cover) gallery[0] = cover
  return gallery
}
