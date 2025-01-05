// /**
//  * Fetch History Action
//  * 
//  * Retrieves chat history with:
//  * - Message fetching
//  * - Data transformation
//  * - Error handling
//  * 
//  * Features:
//  * - Database integration
//  * - Message formatting
//  * - Type conversion
//  * - Error management
//  */

// import { storageActions } from './storage';
// import { ChatMessage } from '@/lib/features/chat/types/chat';

// export async function fetchChatHistory(chatId: string) {
//   try {
//     const { data, error } = await storageActions.database.fetchChatHistory(chatId);
//     if (error) throw error;

//     // Transform DB messages to frontend format
//     const messages = data?.map(msg => ({
//       id: msg.id,
//       chatId: msg.chat_id,
//       messagePairId: msg.message_pair_id,
//       userContent: msg.user_content,
//       assistantContent: msg.assistant_content,
//       userRole: msg.user_role as 'user' | 'system',
//       assistantRole: msg.assistant_role as 'assistant',
//       model: msg.model,
//       dominationField: msg.domination_field,
//       createdAt: msg.created_at,
//       updatedAt: msg.updated_at,
//       status: msg.status || 'success',
//       imageUrl: msg.image_url,
//       customPrompt: msg.custom_prompt,
//       metadata: msg.metadata
//     })) || [];

//     return { data: messages, error: null };
//   } catch (error) {
//     console.error('Error fetching chat history:', error);
//     return { data: null, error };
//   }
// } 