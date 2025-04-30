/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configurar timeout mais longo para as funções serverless poderem iniciar o browser
  serverRuntimeConfig: {
    maxDuration: 60, // 60 segundos
  },
  // Evitar warnings para chrome-aws-lambda e transpilar dependências
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ 
        'puppeteer-core': 'puppeteer-core',
        'chrome-aws-lambda': 'chrome-aws-lambda',
      });
    }

    // Transpilar whatsapp-web.js para evitar problemas de compatibilidade
    config.module.rules.push({
      test: /node_modules[\/\\](whatsapp-web.js|puppeteer-core|chrome-aws-lambda)[\/\\].+\.js$/,
      use: { loader: 'babel-loader' }
    });

    return config;
  },
};

module.exports = nextConfig;