import type { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../src/services/whatsappService';
import Cors from 'cors';

// Inicializando o middleware cors
const cors = Cors({
  methods: ['GET', 'HEAD'],
});

// Função auxiliar para executar middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Executa o middleware
  await runMiddleware(req, res, cors);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const whatsappService = getWhatsAppService();
    
    // Verificar se está conectado
    const status = await whatsappService.getStatus();
    if (!status.isConnected) {
      return res.status(400).json({ 
        success: false, 
        messages: [],
        message: 'WhatsApp não está conectado' 
      });
    }
    
    // Obter parâmetro 'since' para filtrar mensagens por timestamp
    const since = req.query.since ? parseInt(req.query.since as string) : undefined;
    
    // Buscar mensagens
    const messages = await whatsappService.getMessages(since);
    
    return res.status(200).json({ 
      success: true,
      messages
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens WhatsApp:', error);
    return res.status(500).json({ 
      success: false, 
      messages: [],
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}