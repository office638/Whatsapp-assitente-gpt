import { EventEmitter } from 'events';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';

interface Message {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: number;
}

class WhatsAppService extends EventEmitter {
  private client: Client | null = null;
  private qrCodeData: string | null = null;
  private isReady: boolean = false;
  private messages: Message[] = [];
  private isInitializing: boolean = false;

  constructor() {
    super();
    // Inicialização adiada para quando for necessário
  }

  async initialize() {
    if (this.isInitializing || this.client) return;
    
    this.isInitializing = true;
    console.log('Inicializando serviço WhatsApp...');
    
    try {
      // Inicializar cliente do WhatsApp Web
      this.client = new Client({
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        },
        authStrategy: new LocalAuth()
      });

      // Configurar eventos
      this.client.on('qr', async (qr) => {
        console.log('QR Code recebido');
        try {
          this.qrCodeData = await qrcode.toDataURL(qr);
          this.emit('qr', this.qrCodeData);
        } catch (err) {
          console.error('Erro ao gerar QR code:', err);
        }
      });

      this.client.on('ready', () => {
        console.log('Cliente WhatsApp pronto!');
        this.isReady = true;
        this.emit('ready');
      });

      this.client.on('message', async (msg) => {
        console.log('Mensagem recebida:', msg.body);
        
        const newMessage: Message = {
          id: msg.id.id,
          from: msg.from,
          to: msg.to,
          body: msg.body,
          timestamp: Date.now()
        };
        
        this.messages.push(newMessage);
        this.emit('message', newMessage);
      });

      this.client.on('disconnected', (reason) => {
        console.log('Cliente desconectado:', reason);
        this.isReady = false;
        this.client = null;
        this.qrCodeData = null;
        this.emit('disconnected', reason);
        this.isInitializing = false;
      });

      // Iniciar cliente
      await this.client.initialize();
    } catch (error) {
      console.error('Erro ao inicializar cliente WhatsApp:', error);
      this.isInitializing = false;
      throw error;
    }
  }

  async getQRCode(): Promise<string | null> {
    if (this.isReady) {
      return null; // Não há QR code se já estiver conectado
    }
    
    if (!this.client && !this.isInitializing) {
      await this.initialize();
    }
    
    return this.qrCodeData;
  }

  async getStatus(): Promise<{ isConnected: boolean }> {
    return { isConnected: this.isReady };
  }

  async getMessages(since?: number): Promise<Message[]> {
    if (!since) {
      return this.messages;
    }
    
    return this.messages.filter(msg => msg.timestamp > since);
  }

  async sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady || !this.client) {
      return { success: false, error: 'Cliente WhatsApp não está pronto' };
    }
    
    try {
      // Formatar número para o formato correto do WhatsApp
      const formattedNumber = phoneNumber.includes('@c.us') 
        ? phoneNumber 
        : `${phoneNumber.replace(/[^\d]/g, '')}@c.us`;
      
      // Enviar mensagem
      const response = await this.client.sendMessage(formattedNumber, message);
      
      // Adicionar à lista de mensagens
      this.messages.push({
        id: response.id.id,
        from: response.from,
        to: formattedNumber,
        body: message,
        timestamp: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar mensagem' 
      };
    }
  }

  async logout(): Promise<boolean> {
    if (!this.client) {
      return true; // Já está desconectado
    }
    
    try {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.qrCodeData = null;
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return false;
    }
  }
}

// Singleton para o serviço
let instance: WhatsAppService | null = null;

export function getWhatsAppService(): WhatsAppService {
  if (!instance) {
    instance = new WhatsAppService();
  }
  return instance;
}