import { useEffect, useState } from 'react';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<{ isConnected: boolean }>({ isConnected: false });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar o status atual
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);
      
      // Se não estiver conectado, buscar QR code
      if (!data.isConnected) {
        fetchQRCode();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      setError('Falha ao verificar status do WhatsApp');
      setLoading(false);
    }
  };

  // Buscar o QR code
  const fetchQRCode = async () => {
    try {
      const response = await fetch('/api/qrcode');
      const data = await response.json();
      
      if (data.qrcode) {
        setQrCode(data.qrcode);
      } else if (data.isConnected) {
        setStatus({ isConnected: true });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar QR code:', error);
      setError('Falha ao gerar QR code');
      setLoading(false);
    }
  };

  // Iniciar logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/logout', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Reiniciar estados
        setStatus({ isConnected: false });
        setQrCode(null);
        // Buscar novo QR code
        fetchQRCode();
      } else {
        setError('Falha ao fazer logout: ' + data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao desconectar do WhatsApp');
      setLoading(false);
    }
  };

  // Carregar status ao iniciar
  useEffect(() => {
    fetchStatus();
    
    // Verificar status periodicamente
    const interval = setInterval(() => {
      fetchStatus();
    }, 10000); // a cada 10 segundos
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#075e54' }}>WhatsApp Web Microserviço</h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Carregando...</p>
        </div>
      ) : error ? (
        <div style={{ 
          backgroundColor: '#ffcccc', 
          padding: '15px',
          borderRadius: '5px', 
          color: '#d32f2f',
          marginBottom: '20px'
        }}>
          <p>{error}</p>
          <button onClick={fetchStatus} style={{
            padding: '8px 16px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>Tentar novamente</button>
        </div>
      ) : status.isConnected ? (
        <div style={{ 
          backgroundColor: '#e8f5e9', 
          padding: '20px',
          borderRadius: '8px', 
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#2e7d32' }}>WhatsApp Conectado!</h2>
          <p>Seu serviço WhatsApp está ativo e pronto para receber e enviar mensagens.</p>
          <button onClick={handleLogout} style={{
            padding: '10px 20px',
            backgroundColor: '#ff5252',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>Desconectar</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '300px',
            margin: '0 auto'
          }}>
            <h2 style={{ color: '#075e54' }}>Escaneie o QR Code</h2>
            <p>Use o WhatsApp no seu celular para escanear este código</p>
            
            {qrCode ? (
              <div style={{ margin: '20px 0' }}>
                <img src={qrCode} alt="QR Code WhatsApp" style={{ width: '100%' }} />
              </div>
            ) : (
              <div style={{ 
                margin: '20px 0',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
              }}>
                <p>Aguardando QR Code...</p>
              </div>
            )}
            
            <button onClick={fetchQRCode} style={{
              padding: '10px 20px',
              backgroundColor: '#128c7e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>Atualizar QR Code</button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <h3>Endpoints da API</h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          textAlign: 'left',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <code>GET /api/status</code> - Verificar status de conexão
          </li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <code>GET /api/qrcode</code> - Obter QR Code para conexão
          </li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <code>POST /api/send</code> - Enviar mensagem (phoneNumber, message)
          </li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <code>GET /api/messages</code> - Obter mensagens recebidas
          </li>
          <li style={{ padding: '8px 0' }}>
            <code>POST /api/logout</code> - Desconectar do WhatsApp
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;