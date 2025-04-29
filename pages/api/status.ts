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
    const status = await whatsappService.getStatus();
    
    return res.status(200).json(status);
  } catch (error) {
    console.error('Erro ao verificar status do WhatsApp:', error);
    return res.status(500).json({ 
      isConnected: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}