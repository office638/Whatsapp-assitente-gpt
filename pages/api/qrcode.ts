import type { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../src/services/whatsappService';
import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
});

// Helper function to run middleware
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
  // Run the middleware
  await runMiddleware(req, res, cors);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const whatsappService = getWhatsAppService();
    
    // Inicializa o serviço se ainda não estiver inicializado
    if (!(await whatsappService.getStatus()).isConnected) {
      try {
        // Tenta obter o QR code (isso também inicializará o serviço)
        const qrCode = await whatsappService.getQRCode();
        
        if (qrCode) {
          return res.status(200).json({ 
            qrcode: qrCode,
            message: 'QR Code gerado com sucesso'
          });
        } else {
          // Se não conseguiu gerar QR code, pode ser porque já está conectado
          const status = await whatsappService.getStatus();
          if (status.isConnected) {
            return res.status(200).json({ 
              message: 'WhatsApp já está conectado',
              isConnected: true
            });
          } else {
            return res.status(500).json({ 
              message: 'Não foi possível gerar o QR Code'
            });
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar WhatsApp:', error);
        return res.status(500).json({ 
          message: 'Falha ao inicializar o serviço WhatsApp',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    } else {
      // Já está conectado
      return res.status(200).json({ 
        message: 'WhatsApp já está conectado',
        isConnected: true
      });
    }
  } catch (error) {
    console.error('Erro ao processar requisição QR code:', error);
    return res.status(500).json({ 
      message: 'Erro interno no servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}