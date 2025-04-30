/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configurar timeout mais longo para as funções serverless poderem iniciar o browser
  serverRuntimeConfig: {
    maxDuration: 60, // 60 segundos
  },
  // Evitar warnings para chrome-aws-lambda
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ 
        'puppeteer-core': 'puppeteer-core',
        'chrome-aws-lambda': 'chrome-aws-lambda',
      });
    }
    return config;
  },
};

module.exports = nextConfig;