/**
 * Message Processor Service
 * 
 * Processes chat messages with:
 * - History management
 * - System message integration
 * - Image handling
 * - Message formatting
 * 
 * Features:
 * - Chat history processing
 * - System prompt integration
 * - Image support
 * - Null checking
 * - Debug logging
 */

import { FormattedMessage } from '@/lib/types';

export async function processMessages(
  chatHistory: any[],
  prompt: string,
  systemMessage: string,
  imageBase64?: string
): Promise<FormattedMessage[]> {
  console.log('🔄 [messageProcessor] Processing messages:', {
    historyLength: chatHistory.length,
    hasSystemMessage: !!systemMessage,
    hasImage: !!imageBase64
  });

  const messages: FormattedMessage[] = [
    {
      role: 'system',
      content: systemMessage
    }
  ];

  // Add chat history with null checks
  chatHistory.forEach(msg => {
    if (msg && (msg.role || msg.content)) {
      messages.push({
        role: msg.role || 'user',
        content: typeof msg.content === 'string' 
          ? msg.content 
          : msg.content 
            ? JSON.stringify(msg.content) 
            : ''
      });
    }
  });

  // Add current prompt
  messages.push({
    role: 'user',
    content: prompt
  });

  // Add image if present
  if (imageBase64) {
    messages.push({
      role: 'user',
      content: imageBase64,
      type: 'image'
    });
  }

  console.log('✅ [messageProcessor] Messages processed:', {
    totalMessages: messages.length
  });

  return messages;
} 