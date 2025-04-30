import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import { Client } from 'whatsapp-web.js';
import { client, qrCodeData, isConnected, addMessage } from './shared';

export default async function handler(req, res) {
  try {
    // Se já tiver um cliente conectado, retorne o status
    if (isConnected) {
      return res.status(200).json({ 
        isConnected: true,
        message: 'WhatsApp already connected'
      });
    }
    
    // Se já tiver um QR code gerado, retorne-o
    if (qrCodeData) {
      return res.status(200).json({ 
        qrcode: qrCodeData,
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
    client = new Client({ 
      puppeteer: {
        browser,
        args: chromium.args,
      } 
    });
    
    // Hook para capturar o QR code
    client.on('qr', (qr) => {
      console.log('QR Code recebido', qr);
      qrCodeData = qr;
    });
    
    // Hook para detectar conexão bem-sucedida
    client.on('ready', () => {
      console.log('Cliente WhatsApp está pronto!');
      isConnected = true;
      qrCodeData = null;
    });
    
    // Hook para detectar desconexão
    client.on('disconnected', () => {
      console.log('Cliente WhatsApp desconectado');
      isConnected = false;
      qrCodeData = null;
    });
    
    // Inicializa o cliente WhatsApp
    await client.initialize();
    
    // Aguarda um tempo para o QR code ser gerado
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Retorna o QR code para o cliente
    return res.status(200).json({ 
      qrcode: qrCodeData,
      isConnected: false
    });
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    return res.status(500).json({ 
      error: 'Falha ao gerar QR code',
      message: error.message
    });
  }
}