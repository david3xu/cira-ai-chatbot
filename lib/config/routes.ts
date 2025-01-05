// /**
//  * Routes Configuration
//  * 
//  * Defines API and application routes for the chat and document operations.
//  * Uses environment variables for base URL configuration.
//  * 
//  * Features:
//  * - API route definitions for chat and document operations
//  * - Dynamic route generation with parameters
//  * - Centralized route management
//  * - Environment-aware configuration
//  */

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

// export const API_ROUTES = {
//   CHAT: {
//     CREATE: `${BASE_URL}/api/chat`,
//     GET: (chatId: string) => `${BASE_URL}/api/chat/${chatId}`,
//     DELETE: (chatId: string) => `${BASE_URL}/api/chat/${chatId}`,
//     UPDATE_PROMPT: (chatId: string) => `${BASE_URL}/api/chat/${chatId}`,
//     UPDATE_NAME: (chatId: string) => `${BASE_URL}/api/chat/${chatId}`,
//     SEND_MESSAGE: `${BASE_URL}/api/chat/messages`,
//     MESSAGES: {
//       GET: (chatId: string) => `${BASE_URL}/api/chat/messages/${chatId}`,
//       DELETE: (messageId: string) => `${BASE_URL}/api/chat/messages/${messageId}`,
//     }
//   },
//   AI: {
//     COMPLETION: `${BASE_URL}/api/ai/completion`,
//     STREAM: `${BASE_URL}/api/ai/completion/stream`,
//     MODELS: `${BASE_URL}/api/ai/models`,
//     CONTEXT: `${BASE_URL}/api/ai/context`
//   }
// };

// export const APP_ROUTES = {
//   CHAT: {
//     VIEW: (chatId: string) => `/chat/${chatId}`
//   },
//   DOCUMENTS: {
//     VIEW: (documentId: string) => `/documents/${documentId}`,
//     LIST: '/documents'
//   }
// };
