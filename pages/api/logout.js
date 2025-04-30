import { getState, initializeClient } from './shared';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed', 
        message: 'Apenas métodos POST são permitidos'
      });
    }
    
    // Obtém o estado atual
    const state = getState();
    
    // Se não estiver conectado, não há o que desconectar
    if (!state.isConnected) {
      return res.status(200).json({
        success: true,
        message: 'Não havia sessão ativa para desconectar'
      });
    }
    
    // Verifica se temos um cliente inicializado
    if (!state.isInitialized || !state.client) {
      return res.status(500).json({
        error: 'Client not initialized',
        message: 'Cliente WhatsApp não está inicializado corretamente'
      });
    }
    
    // Tenta fazer logout
    try {
      // Este método depende da implementação do shared.js
      // Idealmente, compartilharíamos uma função específica para logout
      await state.client.logout();
      
      return res.status(200).json({
        success: true,
        message: 'Desconectado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao desconectar cliente WhatsApp:', error);
      
      // Mesmo com erro no logout, podemos tentar forçar a desconexão
      try {
        await state.client.destroy();
      } catch (e) {
        console.error('Erro adicional ao destruir cliente:', e);
      }
      
      return res.status(500).json({
        error: 'Logout error',
        message: 'Erro ao desconectar: ' + error.message
      });
    }
  } catch (error) {
    console.error('Erro ao processar logout:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}