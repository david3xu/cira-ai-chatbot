import { FormattedMessage } from '@/lib/types/chat/formattedMessage';
import { getSystemMessage } from '../prompts/systemMessages';

export function processMessages(
  chatHistory: any[],
  prompt: string,
  dominationField: string,
  imageBase64?: string
): FormattedMessage[] {
  const messages: FormattedMessage[] = [
    {
      role: 'system',
      content: getSystemMessage(dominationField)
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

  return messages;
} 