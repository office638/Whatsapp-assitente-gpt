import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import { Client } from 'whatsapp-web.js';
import { 
  getClient, getQrCodeData, getIsConnected, 
  setClient, setQrCodeData, setIsConnected 
} from './shared';

export default async function handler(req, res) {
  try {
    // Se já tiver um cliente conectado, retorne o status
    if (getIsConnected()) {
      return res.status(200).json({ 
        isConnected: true,
        message: 'WhatsApp already connected'
      });
    }
    
    // Se já tiver um QR code gerado, retorne-o
    if (getQrCodeData()) {
      return res.status(200).json({ 
        qrcode: getQrCodeData(),
        isConnected: false 
      });
    }
    
    // Inicializa o browser com o chrome-aws-lambda
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true,
    });
    
    // Configura o cliente WhatsApp
    const whatsappClient = new Client({ 
      puppeteer: {
        browser,
        args: chromium.args,
      } 
    });
    
    // Armazena o cliente no estado compartilhado
    setClient(whatsappClient);
    
    // Hook para capturar o QR code
    whatsappClient.on('qr', (qr) => {
      console.log('QR Code recebido', qr);
      setQrCodeData(qr);
    });
    
    // Hook para detectar conexão bem-sucedida
    whatsappClient.on('ready', () => {
      console.log('Cliente WhatsApp está pronto!');
      setIsConnected(true);
      setQrCodeData(null);
    });
    
    // Hook para detectar desconexão
    whatsappClient.on('disconnected', () => {
      console.log('Cliente WhatsApp desconectado');
      setIsConnected(false);
      setQrCodeData(null);
    });
    
    // Inicializa o cliente WhatsApp
    await whatsappClient.initialize();
    
    // Aguarda um tempo para o QR code ser gerado
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Retorna o QR code para o cliente
    return res.status(200).json({ 
      qrcode: getQrCodeData(),
      isConnected: getIsConnected()
    });
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    return res.status(500).json({ 
      error: 'Falha ao gerar QR code',
      message: error.message
    });
  }
}