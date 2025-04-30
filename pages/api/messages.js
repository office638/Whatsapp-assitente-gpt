import { getState } from './shared';

// Armazena mensagens recebidas para sincronização
let messageQueue = [];

// Configurar a recepção de mensagens quando o cliente for inicializado
(function setupMessageListener() {
  // Esta função será chamada sempre que o módulo for carregado,
  // garantindo que o listener seja configurado quando o cliente estiver pronto
  
  let setupComplete = false;
  
  // Verifica periodicamente se o cliente está disponível e configura o listener
  const interval = setInterval(() => {
    const state = getState();
    
    if (state.isConnected && state.client && !setupComplete) {
      console.log('Configurando listener de mensagens do WhatsApp');
      
      try {
        // Configura o listener de mensagens
        state.client.on('message', (message) => {
          console.log('Nova mensagem recebida:', message.from, message.body.substring(0, 20) + '...');
          
          // Adiciona à fila de mensagens
          messageQueue.push({
            from: message.from,
            to: message.to,
            body: message.body,
            timestamp: new Date(message.timestamp * 1000).toISOString(),
            hasMedia: !!message.hasMedia,
            isGroup: message.isGroup
          });
          
          // Limita o tamanho da fila para evitar uso excessivo de memória
          if (messageQueue.length > 100) {
            messageQueue = messageQueue.slice(-100);
          }
        });
        
        setupComplete = true;
        clearInterval(interval);
        console.log('Listener de mensagens configurado com sucesso');
      } catch (error) {
        console.error('Erro ao configurar listener de mensagens:', error);
      }
    }
  }, 5000); // Verifica a cada 5 segundos
})();

export default async function handler(req, res) {
  try {
    const state = getState();
    
    // Verifica se está conectado
    if (!state.isConnected) {
      return res.status(403).json({
        error: 'Not connected',
        message: 'Não há conexão ativa com o WhatsApp'
      });
    }
    
    // Obtém o parâmetro 'since' (timestamp) da requisição
    const since = req.query.since ? parseInt(req.query.since) : 0;
    
    // Filtra as mensagens recebidas após o timestamp fornecido
    let filteredMessages = messageQueue;
    
    if (since > 0) {
      const sinceDate = new Date(since);
      filteredMessages = messageQueue.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return msgDate > sinceDate;
      });
    }
    
    return res.status(200).json({
      success: true,
      messages: filteredMessages,
      count: filteredMessages.length,
      total: messageQueue.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}