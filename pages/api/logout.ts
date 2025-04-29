import type { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../src/services/whatsappService';
import Cors from 'cors';

// Inicializando o middleware cors
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
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

  // Lidar com requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const whatsappService = getWhatsAppService();
    
    // Fazer logout do WhatsApp
    const success = await whatsappService.logout();
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Logout realizado com sucesso' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Falha ao fazer logout' 
      });
    }
  } catch (error) {
    console.error('Erro ao fazer logout do WhatsApp:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}