import { getQRCode, getState, initializeClient } from './shared';

export default async function handler(req, res) {
  try {
    // Verifica se o cliente já está inicializado, caso contrário inicia
    const state = getState();
    
    if (!state.isInitialized && !state.isInitializing) {
      console.log("Inicializando cliente WhatsApp para obter QR code...");
      await initializeClient();
    }
    
    // Se já está conectado, retorna essa informação
    if (state.isConnected) {
      return res.status(200).json({
        isConnected: true,
        message: 'Cliente WhatsApp já está conectado'
      });
    }
    
    // Obtém o QR code atual
    const qrCodeData = getQRCode();
    
    if (qrCodeData) {
      console.log("QR code encontrado, retornando para o cliente...");
      return res.status(200).json({
        qrcode: qrCodeData,
        isConnected: false,
        lastUpdate: state.lastQRTimestamp,
      });
    } else {
      // Se não temos QR code ainda, verifique se está inicializando
      if (state.isInitializing) {
        return res.status(202).json({
          message: 'Cliente WhatsApp está inicializando, aguarde um momento para o QR code aparecer',
          isConnected: false,
          isInitializing: true
        });
      }
      
      // Se não está inicializando nem temos QR code, provavelmente houve um erro
      if (state.lastError) {
        return res.status(500).json({
          error: 'Falha ao gerar QR code',
          message: state.lastError,
          isConnected: false
        });
      }
      
      // Caso genérico quando não temos QR code ainda
      return res.status(404).json({
        message: 'QR code ainda não disponível, aguarde um momento e tente novamente',
        isConnected: false
      });
    }
  } catch (error) {
    console.error('Erro ao processar solicitação de QR code:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}