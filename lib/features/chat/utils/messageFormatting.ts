// import { ChatMessage } from '@/lib/types';
// // import { fromApiCase } from '@/lib/utils/transformers';

// /**
//  * Message Formatting Utilities
//  * 
//  * Functions:
//  * - formatMessageContent: Cleans message content
//  * - groupMessagesByDate: Groups messages by date
//  * - getMessageTimestamp: Formats message timestamp
//  * 
//  * Features:
//  * - Content cleaning
//  * - Date grouping
//  * - Timestamp formatting
//  * - Case transformation
//  */

// export const formatMessageContent = (content: string): string => {
//   return content.trim();
// };

// export const groupMessagesByDate = (messages: ChatMessage[]) => {
//   return messages.reduce<Record<string, ChatMessage[]>>((groups, message) => {
//     const camelCaseMessage = fromApiCase(message) as ChatMessage;
//     const date = new Date(camelCaseMessage.createdAt).toLocaleDateString();
//     return {
//       ...groups,
//       [date]: [...(groups[date] || []), camelCaseMessage]
//     };
//   }, {});
// };

// export const getMessageTimestamp = (message: ChatMessage): string => {
//   return new Date(message.createdAt).toLocaleTimeString();
// }; 