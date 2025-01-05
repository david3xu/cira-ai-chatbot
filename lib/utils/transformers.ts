// import { DBChat, DBMessage, DBDocument } from '../types/database';
// import { Chat, ChatMessage } from '../types';
// import { Document } from '../types/document';

// export const transformers = {
//   // DB to Frontend
//   chatFromDB: (dbChat: DBChat): Chat => ({
//     id: dbChat.id,
//     name: dbChat.name || null,
//     model: dbChat.model || null,
//     domination_field: dbChat.domination_field || '',
//     created_at: dbChat.created_at || '',
//     updated_at: dbChat.updated_at || ''
//   }),

//   messageFromDB: (dbMessage: DBMessage): ChatMessage => ({
//     id: dbMessage.id,
//     chatId: dbMessage.chat_id || null,
//     userRole: dbMessage.user_role || null,
//     userContent: dbMessage.user_content || null,
//     createdAt: dbMessage.created_at || null
//   }),

//   documentFromDB: (dbDocument: DBDocument): Document => ({
//     id: dbDocument.id,
//     name: dbDocument.name,
//     type: dbDocument.mime_type,
//     size: dbDocument.size,
//     status: dbDocument.status,
//     createdAt: dbDocument.created_at
//   }),

//   // Frontend to DB
//   chatToDB: (chat: Partial<Chat>): Partial<DBChat> => ({
//     title: chat.title,
//     model: chat.model,
//     domination_field: chat.dominationField,
//   }),

//   fromApiCase<T extends Record<string, any>>(obj: T): Record<string, any> {
//     return Object.entries(obj).reduce((acc, [key, value]) => {
//       const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
//       acc[camelKey] = value;
//       return acc;
//     }, {} as Record<string, any>);
//   }
// }; 