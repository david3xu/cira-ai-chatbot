// import { Chat, ChatMessage, ChatUpdate } from '@/lib/types';
// import { databaseActions } from './storage/databaseActions';
// import { persistentActions } from './storage/persistentActions';
// import { sessionActions } from './storage/sessionActions';
// import { ChatStorageManager } from '../utils/ChatStorageManager';

// /**
//  * Chat Storage Actions
//  * 
//  * Centralizes storage operations with:
//  * - Database persistence
//  * - Local storage management
//  * - Session state handling
//  * - Transaction management
//  * 
//  * Features:
//  * - CRUD operations
//  * - Transaction support
//  * - State synchronization
//  * - Error handling
//  */

// export const storage = {
//   // Database operations
//   database: {
//     ...databaseActions,
//   },

//   // Local storage operations
//   persistent: {
//     ...persistentActions,
//   },

//   // Session storage operations
//   session: {
//     ...sessionActions,
//   },

//   // Combined storage operations
//   async saveChat(chat: Chat): Promise<void> {
//     return ChatStorageManager.executeTransaction(async () => {
//       await Promise.all([
//         this.database.saveChat(chat),
//         this.persistent.saveChat(chat)
//       ]);
//       this.session.setChat(chat.id, chat);
//     });
//   },

//   async saveMessage(message: ChatMessage, chatId: string): Promise<void> {
//     return ChatStorageManager.executeTransaction(async () => {
//       await Promise.all([
//         this.database.saveMessage(message),
//         this.persistent.saveMessage(message, chatId)
//       ]);
//     });
//   },

//   async deleteChat(chatId: string): Promise<void> {
//     return ChatStorageManager.executeTransaction(async () => {
//       await Promise.all([
//         this.database.deleteChat(chatId),
//         this.persistent.removeChat(chatId)
//       ]);
//       this.session.setCurrentChat(null);
//     });
//   },

//   async updateChat(chatId: string, updates: ChatUpdate) {
//     return ChatStorageManager.executeTransaction(async () => {
//       const [dbResult, persistentResult] = await Promise.all([
//         this.database.updateChat(chatId, updates),
//         this.persistent.updateChat(chatId, updates)
//       ]);

//       if (dbResult.error || persistentResult.error) {
//         throw new Error('Failed to update chat');
//       }

//       return dbResult.data;
//     });
//   }
// };
