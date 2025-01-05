// /**
//  * Database Actions
//  * 
//  * Manages database operations for:
//  * - Chat persistence
//  * - Message storage
//  * - Transaction handling
//  * - Data fetching
//  * 
//  * Features:
//  * - Transaction support
//  * - Error handling
//  * - Data transformation
//  * - CRUD operations
//  * - Supabase integration
//  */

// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { Database } from '@/supabase/types/database.types';
// import { cookies } from 'next/headers';

// interface MessageData {
//   chatId: string;
//   content: string;
//   role: 'user' | 'assistant';
//   messagePairId?: string;
//   model?: string;
//   status?: 'sending' | 'success' | 'error';
//   dominationField?: string;
//   customPrompt?: string;
// }

// interface ModelSettings {
//   model: string;
//   temperature?: number;
//   max_tokens?: number;
// }

// interface FileMetadata {
//   chatId: string;
//   userId: string;
//   name: string;
//   type: string;
//   size: number;
//   path: string;
// }

// interface DocumentData {
//   content: string;
//   dominationField: string;
//   embedding: number[];
// }

// interface SearchParams {
//   query: string;
//   embedding: number[];
//   matchCount?: number;
//   dominationField?: string;
// }

// export const databaseActions = {
//   // Chat Operations
//   createChat: async (userId: string, data: { model: string, name?: string }) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { data: chat, error } = await supabase
//       .from('chats')
//       .insert({
//         user_id: userId,
//         model: data.model,
//         name: data.name || 'New Chat'
//       })
//       .select()
//       .single();

//     if (error) throw error;
//     return chat;
//   },

//   getChatHistory: async (chatId: string) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { data, error } = await supabase
//       .from('chat_history')
//       .select('*')
//       .eq('chat_id', chatId)
//       .order('created_at', { ascending: true });

//     if (error) throw error;
//     return data;
//   },

//   // Message Operations
//   saveMessage: async (message: MessageData) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const messageData = {
//       chat_id: message.chatId,
//       message_pair_id: message.messagePairId || crypto.randomUUID(),
//       [`${message.role}_content`]: message.content || '',
//       [`${message.role}_role`]: message.role,
//       model: message.model || null,
//       status: message.status || 'sending',
//       domination_field: message.dominationField || 'general',
//       custom_prompt: message.customPrompt || null
//     };

//     const { error } = await supabase
//       .from('chat_history')
//       .insert(messageData);

//     if (error) throw error;
//   },

//   updateMessageStatus: async (messagePairId: string, updates: {
//     assistantContent?: string;
//     status: 'success' | 'error';
//   }) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { error } = await supabase
//       .from('chat_history')
//       .update({
//         assistant_content: updates.assistantContent,
//         status: updates.status
//       })
//       .eq('message_pair_id', messagePairId);

//     if (error) throw error;
//   },

//   deleteMessage: async (messageId: string) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { error } = await supabase
//       .from('chat_history')
//       .delete()
//       .eq('id', messageId);

//     if (error) throw error;
//   },

//   // Model Settings
//   getModelSettings: async (userId: string) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { data, error } = await supabase
//       .from('model_settings')
//       .select('*')
//       .eq('user_id', userId)
//       .single();

//     if (error) throw error;
//     return data;
//   },

//   updateModelSettings: async (userId: string, settings: ModelSettings) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { error } = await supabase
//       .from('model_settings')
//       .upsert({
//         user_id: userId,
//         ...settings
//       });

//     if (error) throw error;
//   },

//   // File Operations
//   uploadFile: async (userId: string, chatId: string, file: File) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
    
//     // Use transaction to ensure both storage and database operations succeed
//     const { data: storageData, error: storageError } = await supabase
//       .storage
//       .from('chat-files')
//       .upload(`${userId}/${chatId}/${file.name}`, file);

//     if (storageError) throw storageError;

//     const fileMetadata: FileMetadata = {
//       chatId,
//       userId,
//       name: file.name,
//       type: file.type,
//       size: file.size,
//       path: storageData.path
//     };

//     const { error: dbError } = await supabase
//       .from('files')
//       .insert(fileMetadata);

//     if (dbError) {
//       // Rollback storage upload if database insert fails
//       await supabase.storage.from('chat-files').remove([storageData.path]);
//       throw dbError;
//     }

//     return storageData;
//   },

//   getFile: async (fileId: string) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { data: file, error: fetchError } = await supabase
//       .from('files')
//       .select('*')
//       .eq('id', fileId)
//       .single();

//     if (fetchError) throw fetchError;

//     const { data, error: urlError } = await supabase
//       .storage
//       .from('chat-files')
//       .createSignedUrl(file.path, 60);
//     if (!data) throw new Error('Failed to get signed URL');
//     const { signedUrl } = data;

//     return { ...file, url: signedUrl };
//   },

//   deleteFile: async (fileId: string) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
    
//     // Use transaction to ensure both storage and database operations succeed
//     const { data: file, error: fetchError } = await supabase
//       .from('files')
//       .select('path')
//       .eq('id', fileId)
//       .single();

//     if (fetchError) throw fetchError;

//     const { error: storageError } = await supabase
//       .storage
//       .from('chat-files')
//       .remove([file.path]);

//     if (storageError) throw storageError;

//     const { error: dbError } = await supabase
//       .from('files')
//       .delete()
//       .eq('id', fileId);

//     if (dbError) throw dbError;
//   },

//   // Document Operations
//   saveDocument: async (document: DocumentData) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { error } = await supabase
//       .from('documents')
//       .insert({
//         content: document.content,
//         domination_field: document.dominationField,
//         embedding: JSON.stringify(document.embedding)
//       });

//     if (error) throw error;
//   },

//   searchDocuments: async (params: SearchParams) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { data, error } = await supabase.rpc('hybrid_search', {
//       query_text: params.query,
//       query_embedding: JSON.stringify(params.embedding),
//       match_count: params.matchCount || 5,
//       in_domination_field: params.dominationField || 'general'
//     });

//     if (error) throw error;
//     return data;
//   },

//   getDocument: async (documentId: string) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { data, error } = await supabase
//       .from('documents')
//       .select('*')
//       .eq('id', documentId)
//       .single();

//     if (error) throw error;
//     return data;
//   },

//   updateDocument: async (documentId: string, updates: Partial<DocumentData>) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { error } = await supabase
//       .from('documents')
//       .update({
//         content: updates.content,
//         domination_field: updates.dominationField,
//         embedding: updates.embedding ? JSON.stringify(updates.embedding) : undefined
//       })
//       .eq('id', documentId);

//     if (error) throw error;
//   },

//   deleteDocument: async (documentId: string) => {
//     const supabase = createRouteHandlerClient<Database>({ cookies });
//     const { error } = await supabase
//       .from('documents')
//       .delete()
//       .eq('id', documentId);

//     if (error) throw error;
//   }
// };
