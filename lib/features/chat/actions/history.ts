// import { ChatMessage } from '@/lib/types';
// import { storage } from './storage';
// import { ChatStorageManager } from '../utils/ChatStorageManager';

// /**
//  * Chat History Actions
//  * 
//  * Manages chat history with:
//  * - Message fetching
//  * - History synchronization
//  * - State management
//  * 
//  * Features:
//  * - History retrieval
//  * - Message formatting
//  * - Error handling
//  * - Loading states
//  */

// interface ChatHistoryResponse {
//   data: {
//     id: string;
//     chat_id: string | null;
//     message_pair_id: string | null;
//     user_content: string | null;
//     assistant_content: string | null;
//     user_role: string | null;
//     assistant_role: string | null;
//     model: string | null;
//     domination_field: string | null;
//     created_at: string | null;
//     updated_at: string | null;
//     status: string | null;
//     image_url: string | null;
//     custom_prompt: string | null;
//     metadata: any;
//   }[];
//   error: any;
// }

// export const history = {
//   async fetchChatHistory(chatId: string) {
//     return ChatStorageManager.executeTransaction(async () => {
//       try {
//         const dbResponse = await storage.database.getChatHistory(chatId);
//         const response: ChatHistoryResponse = {
//           data: dbResponse,
//           error: null
//         };
//         if (response.error) throw response.error;

//         // Transform DB messages to frontend format
//         const messages = response.data?.map(msg => ({
//           id: msg.id,
//           chatId: msg.chat_id,
//           messagePairId: msg.message_pair_id,
//           userContent: msg.user_content,
//           assistantContent: msg.assistant_content,
//           userRole: msg.user_role as 'user' | 'system',
//           assistantRole: msg.assistant_role as 'assistant',
//           model: msg.model,
//           dominationField: msg.domination_field,
//           createdAt: msg.created_at,
//           updatedAt: msg.updated_at,
//           status: msg.status || 'success',
//           imageUrl: msg.image_url,
//           customPrompt: msg.custom_prompt,
//           metadata: msg.metadata
//         })) || [];

//         return { data: messages, error: null };
//       } catch (error) {
//         console.error('Error fetching chat history:', error);
//         return { data: null, error };
//       }
//     });
//   },

//   async syncHistory(chatId: string, messages: ChatMessage[]) {
//     return ChatStorageManager.executeTransaction(async () => {
//       try {
//         await Promise.all(
//           messages.map(message => 
//             storage.saveMessage(message, chatId)
//           )
//         );
//         return { success: true, error: null };
//       } catch (error) {
//         console.error('Error syncing history:', error);
//         return { success: false, error };
//       }
//     });
//   }
// };
