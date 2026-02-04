/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router habilitado
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@radix-ui/react-avatar', '@radix-ui/react-dialog', 'lucide-react'],
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  reactStrictMode: false,  // Desabilitado temporariamente para evitar requisições duplicadas em desenvolvimento
  // Desabilitar auto-refresh em desenvolvimento
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    // !! WARN !!
    ignoreDuringBuilds: true,
  },
  // Forçar standalone e desabilitar geração estática para evitar prerender errors
  output: 'standalone',
  trailingSlash: true,
  // Desabilitar geração estática
  generateEtags: false,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://atendo.website' : 'http://localhost:8000'),
    PUBLIC_URL: process.env.PUBLIC_URL || (process.env.NODE_ENV === 'production' ? 'https://atendo.website' : 'http://localhost:3000'),
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'atendo.website',
      },
    ],
  },
  // Allow cross-origin requests from production domain
  allowedDevOrigins: [
    'atendo.website',
    'http://atendo.website',
    'https://atendo.website',
  ],
  // Otimizações para desenvolvimento
  swcMinify: true,
  compiler: {
    removeConsole: false, // Manter console logs para debug
  },
  // Cache para rebuilds mais rápidos
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
