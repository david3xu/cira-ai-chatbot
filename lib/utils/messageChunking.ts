// import { MessageChunk } from "../types/chat/messageContent";

// const CHUNK_SIZE = 4000; // PostgreSQL has a limit of ~1GB per field

// export function shouldChunkContent(content: string): boolean {
//   return content.length > CHUNK_SIZE;
// }

// export function createMessageChunks(
//   messageId: string, 
//   content: string, 
//   type: 'user' | 'assistant'
// ): MessageChunk[] {
//   const chunks: MessageChunk[] = [];
  
//   for (let i = 0; i < content.length; i += CHUNK_SIZE) {
//     chunks.push({
//       message_id: messageId,
//       content_type: type,
//       content_chunk: content.slice(i, i + CHUNK_SIZE),
//       chunk_order: Math.floor(i / CHUNK_SIZE)
//     });
//   }
  
//   return chunks;
// } 