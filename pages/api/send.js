import { getState, initializeClient } from './shared';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed', 
        message: 'Apenas métodos POST são permitidos'
      });
    }

    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Os campos phoneNumber e message são obrigatórios'
      });
    }

    // Verificar se o cliente está conectado
    const state = getState();
    
    if (!state.isConnected) {
      return res.status(403).json({
        error: 'Not connected',
        message: 'O cliente WhatsApp não está conectado'
      });
    }

    // Tenta inicializar se ainda não estiver inicializado
    if (!state.isInitialized) {
      await initializeClient();
    }

    // Formata o número de telefone para o padrão do WhatsApp (se necessário)
    const formattedNumber = phoneNumber.includes('@c.us') 
      ? phoneNumber 
      : `${phoneNumber.replace(/\D/g, '')}@c.us`;
    
    // Envia a mensagem usando o cliente do WhatsApp
    // (Assumindo que state.client está corretamente definido em shared.js)
    await state.client.sendMessage(formattedNumber, message);

    return res.status(200).json({
      success: true,
      phoneNumber: formattedNumber,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      error: 'Failed to send message',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}