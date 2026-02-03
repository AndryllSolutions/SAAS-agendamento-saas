/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    PUBLIC_URL: process.env.PUBLIC_URL || 'http://localhost:3000',
  },
  images: {
    domains: ['localhost', '*.ngrok-free.app', '*.ngrok.io'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.ngrok-free.app' },
      { protocol: 'https', hostname: '**.ngrok.io' },
    ],
  },
  allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok.io'],
  
  // Otimizacoes agressivas para desenvolvimento
  swcMinify: true,
  compiler: { removeConsole: false },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog', 
      'lucide-react',
      'axios',
      'date-fns'
    ],
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Cache agressivo
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minuto
    pagesBufferLength: 5,
  },
  
  // Ignorar paginas nao essenciais no build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Reduzir rebuilds
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;