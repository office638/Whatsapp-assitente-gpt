export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        WhatsApp Web API Microservice
      </h1>
      <p style={{ maxWidth: '600px', lineHeight: '1.6', marginBottom: '2rem' }}>
        Esta é uma API para interagir com o WhatsApp Web. Os endpoints desta API são usados pelo aplicativo principal para conectar-se ao WhatsApp.
      </p>
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '5px', 
        padding: '20px', 
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#f8f9fa',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Endpoints disponíveis:</h2>
        <ul style={{ textAlign: 'left', listStylePosition: 'inside' }}>
          <li><code>/api/qrcode</code> - Obter QR code para login</li>
          <li><code>/api/status</code> - Verificar status da conexão</li>
          <li><code>/api/messages</code> - Buscar mensagens recebidas</li>
          <li><code>/api/send</code> - Enviar mensagem</li>
          <li><code>/api/logout</code> - Desconectar do WhatsApp</li>
        </ul>
      </div>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Esta é uma API privada para uso exclusivo do aplicativo principal.
      </p>
    </div>
  )
}