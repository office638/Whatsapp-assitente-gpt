// Compartilha o mesmo estado do cliente com o endpoint qrcode.js
import { client, isConnected } from './shared';

export default async function handler(req, res) {
  try {
    return res.status(200).json({
      isConnected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return res.status(500).json({ 
      error: 'Falha ao verificar status',
      message: error.message
    });
  }
}