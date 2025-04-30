import { getState, initializeClient } from './shared';

export default async function handler(req, res) {
  try {
    // Obtém o estado atual
    const state = getState();
    
    // Se já está inicializado ou em processo de inicialização
    if (state.isInitialized) {
      return res.status(200).json({
        success: true,
        message: 'Cliente WhatsApp já está inicializado',
        isConnected: state.isConnected
      });
    }
    
    if (state.isInitializing) {
      return res.status(202).json({
        success: true,
        message: 'Cliente WhatsApp já está sendo inicializado',
        isInitializing: true
      });
    }
    
    // Inicia o processo de inicialização em segundo plano
    console.log('Iniciando WhatsApp client via API startup');
    initializeClient().catch(error => {
      console.error('Erro ao inicializar cliente via API startup:', error);
    });
    
    return res.status(202).json({
      success: true,
      message: 'Inicialização iniciada',
      isInitializing: true
    });
  } catch (error) {
    console.error('Erro no endpoint de startup:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}