/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Move serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: ['mongoose'],
  // Configure API routes for Vercel Blob
  api: {
    bodyParser: {
      sizeLimit: '500mb', // Vercel Blob supports up to 500MB
    },
    responseLimit: '500mb', // Vercel Blob supports up to 500MB
  },
}

export default nextConfig
