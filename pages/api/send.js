import { client, isConnected } from './shared';

export default async function handler(req, res) {
  try {
    // Verificar se o cliente está conectado
    if (!isConnected || !client) {
      return res.status(400).json({ 
        success: false,
        error: 'Cliente WhatsApp não está conectado' 
      });
    }
    
    // Verificar se o método é POST
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        error: 'Método não permitido' 
      });
    }
    
    // Extrair dados do corpo da requisição
    const { phoneNumber, message } = req.body;
    
    // Validar dados
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Número de telefone e mensagem são obrigatórios' 
      });
    }
    
    // Formatar número de telefone se necessário
    const formattedNumber = phoneNumber.includes('@c.us') 
      ? phoneNumber 
      : `${phoneNumber.replace(/\D/g, '')}@c.us`;
    
    // Enviar mensagem
    await client.sendMessage(formattedNumber, message);
    
    return res.status(200).json({
      success: true,
      phoneNumber: formattedNumber,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Falha ao enviar mensagem',
      message: error.message
    });
  }
}