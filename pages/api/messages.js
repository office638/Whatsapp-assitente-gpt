import { messages } from './shared';

export default async function handler(req, res) {
  try {
    let responseMessages = messages;
    
    // Filtrar mensagens desde timestamp especificado, se fornecido
    const since = req.query.since ? parseInt(req.query.since) : 0;
    if (since > 0) {
      responseMessages = messages.filter(msg => msg.timestamp > since);
    }
    
    return res.status(200).json({
      messages: responseMessages,
      count: responseMessages.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    return res.status(500).json({ 
      error: 'Falha ao obter mensagens',
      message: error.message
    });
  }
}