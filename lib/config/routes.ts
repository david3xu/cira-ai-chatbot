const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export const API_ROUTES = {
  CHAT: {
    CREATE: `${BASE_URL}/api/chat/create`,
    GET: (chatId: string) => `${BASE_URL}/api/chat/${chatId}`,
    DELETE: (chatId: string) => `${BASE_URL}/api/chat/${chatId}`,
    UPDATE_PROMPT: `${BASE_URL}/api/chat/update-prompt`,
    UPDATE_MODEL: (chatId: string) => `${BASE_URL}/api/chat/${chatId}/model`,
    SEND_MESSAGE: `${BASE_URL}/api/chat/send-message`,
    PROCESS_MARKDOWN: `${BASE_URL}/api/chat/process-markdown`,
    UPDATE_NAME: (chatId: string) => `${BASE_URL}/api/chat/${chatId}/name`
  },
  OLLAMA: {
    EMBEDDINGS: `${BASE_URL}/api/embeddings`,
    // ... other ollama routes
    // 
  }
};

export const APP_ROUTES = {
  CHAT: {
    VIEW: (chatId: string) => `/chat/${chatId}`
  }
};
