#!/usr/bin/env node

/**
 * Script para otimizar build do Next.js
 * Remove paginas nao utilizadas do build de desenvolvimento
 */

const fs = require('fs');
const path = require('path');

// Paginas essenciais para manter no build
const ESSENTIAL_PAGES = [
  'login',
  'register', 
  'dashboard',
  'appointments',
  'clients',
  'services',
  'professionals',
  'products',
  'financial',
  'reports',
  'calendar',
  'settings',
  'page' // root
];

// Paginas que podem ser lazy-loaded (build sob demanda)
const LAZY_PAGES = [
  'addons',
  'admin',
  'anamneses',
  'api-keys',
  'book',
  'cashback',
  'commands',
  'commissions',
  'company-settings',
  'configuracoes',
  'consulting',
  'documents',
  'evaluations',
  'goals',
  'help',
  'invoices',
  'marketing',
  'news',
  'notifications',
  'onboarding',
  'packages',
  'payments',
  'plans',
  'promotions',
  'purchases',
  'reviews',
  'saas-admin',
  'scheduling',
  'subscription-sales',
  'suppliers',
  'unauthorized',
  'users',
  'whatsapp'
];

const appDir = path.join(__dirname, '../src/app');

function createOptimizedBuild() {
  console.log('🔧 Criando build otimizado...');
  
  // Criar arquivo .nextignore para ignorar paginas lazy
  const nextIgnorePath = path.join(__dirname, '../.nextignore');
  const ignoreContent = [
    '# Ignorar paginas lazy-loaded para build mais rapido',
    ...LAZY_PAGES.map(page => `src/app/${page}/**`),
    '# Manter paginas essenciais',
    ...ESSENTIAL_PAGES.map(page => `!src/app/${page}/**`),
    '# Manter arquivos globais',
    '!src/app/globals.css',
    '!src/app/layout.tsx',
    '!src/app/api/**'
  ].join('\n');
  
  fs.writeFileSync(nextIgnorePath, ignoreContent);
  console.log('✅ .nextignore criado');
  
  // Criar next.config.js otimizado para dev
  const optimizedConfig = `/** @type {import('next').NextConfig} */
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

module.exports = nextConfig;`;
  
  fs.writeFileSync(path.join(__dirname, '../next.config.dev.js'), optimizedConfig);
  console.log('✅ next.config.dev.js criado');
  
  console.log('🚀 Build otimizado pronto!');
  console.log('📝 Use: npm run dev:optimized');
}

// Adicionar script ao package.json
function updatePackageJson() {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.scripts['dev:optimized'] = 'NEXT_CONFIG_PATH=./next.config.dev.js next dev';
  packageJson.scripts['build:optimized'] = 'NEXT_CONFIG_PATH=./next.config.dev.js next build';
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Scripts adicionados ao package.json');
}

if (require.main === module) {
  createOptimizedBuild();
  updatePackageJson();
}

module.exports = { createOptimizedBuild, updatePackageJson };
