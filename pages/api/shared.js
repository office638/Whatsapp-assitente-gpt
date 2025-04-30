import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

/**
 * Implementação baseada nas recomendações para garantir um QR code válido
 * 1. Usar o evento 'qr' do whatsapp-web.js diretamente
 * 2. Implementar LocalAuth para persistir a sessão (evita QR codes repetidos)
 * 3. Configurar corretamente o puppeteer para ambientes serverless
 *
 * O principal problema do QR inválido é causado porque:
 * - QRs gerados localmente (não pelo evento oficial) são rejeitados pelo WhatsApp
 * - QRs expiram em cerca de 1-2 minutos
 * - Ambiente serverless mata o processo entre requisições (cliente nunca fica "ready")
 */

// Estado global do serviço
let state = {
  isInitialized: false,
  isConnected: false,
  isInitializing: false,
  qrCodeData: null,
  lastQRTimestamp: null,
  client: null,
  lastError: null
};

// Funções de utilidade
export function getState() {
  return {
    isConnected: state.isConnected,
    isInitialized: state.isInitialized,
    lastQRTimestamp: state.lastQRTimestamp,
    lastError: state.lastError
  };
}

export function getQRCode() {
  return state.qrCodeData;
}

// Inicializa o cliente WhatsApp (apenas uma vez)
export async function initializeClient() {
  if (state.isInitializing || state.isInitialized) {
    return state;
  }

  state.isInitializing = true;
  state.lastError = null;

  try {
    console.log('Iniciando cliente WhatsApp Web...');
    
    // Cria o cliente com persistência local usando LocalAuth
    // Isso permite que o serviço se reconecte sem precisar de novo QR
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'assistente-whatsapp',
        dataPath: '/tmp/whatsapp-auth' // Pasta onde os dados de autenticação serão salvos
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', // Importante para ambientes com pouca memória
          '--disable-gpu'
        ]
      },
      // Definindo explicitamente sem cache para evitar problemas de versão
      webVersionCache: {
        type: 'none'
      }
    });

    // Configurar eventos
    client.on('qr', async (qr) => {
      console.log('Recebido QR code oficial do WhatsApp');
      
      try {
        // Converter para imagem base64 usando o QR recebido do evento oficial
        // Esse é o ponto crucial: o QR precisa vir diretamente do evento do WhatsApp
        const qrCodeImage = await qrcode.toDataURL(qr);
        state.qrCodeData = qrCodeImage;
        state.lastQRTimestamp = new Date();
        
        console.log('QR code convertido para imagem com sucesso');
      } catch (error) {
        console.error('Erro ao gerar QR code:', error);
        state.lastError = 'Erro ao gerar QR code: ' + error.message;
      }
    });

    client.on('ready', () => {
      console.log('Cliente WhatsApp conectado com sucesso!');
      state.isConnected = true;
      state.qrCodeData = null; // Remove o QR code quando não é mais necessário
    });
    
    client.on('authenticated', () => {
      console.log('Cliente autenticado com sucesso!');
    });

    client.on('auth_failure', (error) => {
      console.error('Falha na autenticação:', error);
      state.lastError = 'Falha na autenticação: ' + error.message;
      
      // Podemos tentar reiniciar em caso de falha
      setTimeout(() => {
        state.isInitialized = false;
        state.isInitializing = false;
        initializeClient().catch(console.error);
      }, 5000);
    });

    client.on('disconnected', (reason) => {
      console.log('Cliente WhatsApp desconectado, motivo:', reason);
      state.isConnected = false;
      state.isInitialized = false;
      
      // Reiniciar cliente após desconexão
      setTimeout(() => {
        state.isInitializing = false;
        initializeClient().catch(console.error);
      }, 5000);
    });

    // Inicializar cliente
    console.log('Inicializando conexão com WhatsApp...');
    await client.initialize();
    
    state.client = client;
    state.isInitialized = true;
    state.isInitializing = false;
    
    return state;
  } catch (error) {
    console.error('Erro ao inicializar cliente WhatsApp:', error);
    state.lastError = 'Erro ao inicializar: ' + error.message;
    state.isInitializing = false;
    state.isInitialized = false;
    state.client = null;
    
    return state;
  }
}

// Inicializar automaticamente quando o serviço for carregado
if (typeof window === 'undefined') { // Executar apenas no servidor
  console.log('Iniciando serviço WhatsApp...');
  setTimeout(() => {
    initializeClient().catch(error => {
      console.error('Erro na inicialização automática:', error);
    });
  }, 1000); // Pequeno delay para permitir que o serviço inicialize completamente
}