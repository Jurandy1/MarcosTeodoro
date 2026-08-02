/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['sharp'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'ukbirdsuhvsvijtjhjaj.supabase.co' },
      { protocol: 'https', hostname: 'dwvimagesv1.b-cdn.net' },
      { protocol: 'https', hostname: 'dwvimages.s3.amazonaws.com' },
    ],
  },
}

export default nextConfig
