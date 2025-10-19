/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Move serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: ['mongoose'],
}

export default nextConfig
