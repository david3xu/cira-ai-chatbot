import { 
  ChatCompletionContentPartText, 
  ChatCompletionMessageParam,
  ChatCompletionContentPart
} from 'openai/resources/chat/completions.mjs';
import { getSystemMessage } from '@/actions/ai/prompts/systemMessages';
import { ChatMessage } from '@/lib/chat';
import { DocumentContent } from '@/types/messages';

type MessageContent = {
  type: 'text' | 'image_url' | 'image_file';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'auto' | 'high';
  };
  image_file?: {
    file: string;
    detail?: 'low' | 'auto' | 'high';
  };
};

// Simplified type guard
const isMessageContent = (content: any): content is MessageContent =>
  content?.type && ['text', 'image_url', 'image_file'].includes(content.type);

const isDocumentContent = (content: any): content is DocumentContent =>
  'text' in content && (!('type' in content) || typeof content.document === 'object');

const convertToContentPart = (content: MessageContent | DocumentContent): ChatCompletionContentPart => {
  if (isMessageContent(content)) {
    switch(content.type) {
      case 'text':
        return { type: 'text', text: content.text || '' };
      case 'image_url':
        return {
          type: 'image_url',
          image_url: {
            url: content.image_url?.url || '',
            detail: content.image_url?.detail || 'low'
          }
        };
      case 'image_file':
        return {
          type: 'image_url',
          image_url: {
            url: content.image_file?.file || '',
            detail: content.image_file?.detail || 'low'
          }
        };
    }
  }
  
  if (isDocumentContent(content)) {
    return {
      type: 'text',
      text: content.document ? 
        `${content.text}\n\nDocument: ${content.document.text}` : 
        content.text
    };
  }
  
  throw new Error('Unsupported content type');
};

const createMessageParam = (
  role: 'system' | 'user' | 'assistant',
  content: string | MessageContent | MessageContent[] | DocumentContent
): ChatCompletionMessageParam => {
  if (typeof content === 'string') {
    return { role, content };
  }

  if (role === 'user') {
    const contentArray = Array.isArray(content) ? content : [content];
    return {
      role: 'user',
      content: contentArray.map(convertToContentPart)
    };
  }

  // For system and assistant messages, always convert to string
  return {
    role,
    content: typeof content === 'string' ? content :
      Array.isArray(content) ? content.map(c => c.text || '').join('\n') :
      isDocumentContent(content) ? content.text :
      isMessageContent(content) ? content.text || '' : ''
  };
};

export const processMessages = (
  messages: ChatMessage[],
  prompt: string,
  dominationField: string,
  imageFile?: string
): ChatCompletionMessageParam[] => {
  const validMessages = messages.filter(msg => 
    msg.content && (typeof msg.content === 'string' ? msg.content.trim() !== '' : true)
  );

  const apiMessages = [
    createMessageParam('system', getSystemMessage(dominationField)),
    createMessageParam('user', prompt),
    ...validMessages.map(msg => createMessageParam(msg.role as 'system' | 'user' | 'assistant', msg.content.toString() ))
  ];

  if (imageFile) {
    const lastMessage = apiMessages[apiMessages.length - 1];
    if (lastMessage.role === 'user') {
      const imageContent: ChatCompletionContentPart = {
        type: 'image_url',
        image_url: { url: imageFile, detail: 'low' }
      };

      lastMessage.content = Array.isArray(lastMessage.content) 
        ? [...lastMessage.content, imageContent]
        : [{ type: 'text', text: String(lastMessage.content) }, imageContent];
    }
  }

  return apiMessages;
};
