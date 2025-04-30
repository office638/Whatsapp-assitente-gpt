// Estado compartilhado entre os endpoints
const state = {
  client: null,
  qrCodeData: null,
  isConnected: false,
  messages: []
};

// Exportar getters para ler os estados
export const getClient = () => state.client;
export const getQrCodeData = () => state.qrCodeData;
export const getIsConnected = () => state.isConnected;
export const getMessages = () => state.messages;

// Exportar setters para alterar os estados
export const setClient = (newClient) => { state.client = newClient; };
export const setQrCodeData = (data) => { state.qrCodeData = data; };
export const setIsConnected = (status) => { state.isConnected = status; };

// Lista para armazenar mensagens recebidas em cache
export function addMessage(message) {
  state.messages.push({
    id: Date.now(),
    from: message.from,
    body: message.body,
    timestamp: Date.now()
  });
  
  // Limitar o cache a 100 mensagens
  if (state.messages.length > 100) {
    state.messages = state.messages.slice(state.messages.length - 100);
  }
}

// Para compatibilidade com código existente
export const client = state.client;
export const qrCodeData = state.qrCodeData;
export const isConnected = state.isConnected;
export const messages = state.messages;