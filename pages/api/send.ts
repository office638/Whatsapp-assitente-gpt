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

  // Validar corpo da requisição
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Número de telefone e mensagem são obrigatórios' 
    });
  }

  try {
    const whatsappService = getWhatsAppService();
    
    // Verificar se está conectado
    const status = await whatsappService.getStatus();
    if (!status.isConnected) {
      return res.status(400).json({ 
        success: false, 
        message: 'WhatsApp não está conectado' 
      });
    }
    
    // Enviar mensagem
    const result = await whatsappService.sendMessage(phoneNumber, message);
    
    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Mensagem enviada com sucesso' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: result.error || 'Falha ao enviar mensagem' 
      });
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}