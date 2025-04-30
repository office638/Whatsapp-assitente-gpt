// Estado compartilhado entre os endpoints
export let client = null;
export let qrCodeData = null;
export let isConnected = false;
export let messages = [];

// Lista para armazenar mensagens recebidas em cache
export function addMessage(message) {
  messages.push({
    id: Date.now(),
    from: message.from,
    body: message.body,
    timestamp: Date.now()
  });
  
  // Limitar o cache a 100 mensagens
  if (messages.length > 100) {
    messages = messages.slice(messages.length - 100);
  }
}