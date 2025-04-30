import { client, isConnected } from './shared';

export default async function handler(req, res) {
  try {
    // Verificar se o cliente está conectado
    if (!isConnected || !client) {
      return res.status(200).json({ 
        success: true,
        message: 'Cliente já estava desconectado'
      });
    }
    
    // Desconectar cliente
    await client.destroy();
    
    // Atualizar estado
    isConnected = false;
    
    return res.status(200).json({
      success: true,
      message: 'Desconectado com sucesso',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Falha ao desconectar',
      message: error.message
    });
  }
}