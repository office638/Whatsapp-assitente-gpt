import { getState, initializeClient } from './shared';

export default async function handler(req, res) {
  try {
    // Obtém o estado atual do serviço
    const state = getState();
    
    // Se o cliente não estiver inicializado, inicia-o
    if (!state.isInitialized && !state.isInitializing) {
      console.log('Cliente não inicializado. Iniciando...');
      // Inicia a inicialização, mas não aguarda para não bloquear a resposta
      initializeClient().catch(error => {
        console.error('Erro ao inicializar cliente em segundo plano:', error);
      });
    }
    
    // Retorna o status atual
    return res.status(200).json({
      isConnected: state.isConnected,
      isInitialized: state.isInitialized,
      isInitializing: state.isInitializing,
      lastQRTimestamp: state.lastQRTimestamp,
      lastError: state.lastError
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}