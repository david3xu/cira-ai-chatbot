import { 
  ChatCompletionContentPartText, 
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionAssistantMessageParam,
  ChatCompletionContentPart
} from 'openai/resources/chat/completions.mjs';
import { getSystemMessage } from '@/actions/ai/prompts/systemMessages';
import { ChatMessage } from '@/lib/chat';
import { MessageContent, DocumentContent } from '@/types/messages';

type ValidMessageRole = 'system' | 'user' | 'assistant';

// Type guard functions
function isMessageContent(content: any): content is MessageContent {
  return 'type' in content && (content.type === 'text' || content.type === 'image_url');
}

function isDocumentContent(content: any): content is DocumentContent {
  return 'text' in content && (!('type' in content) || typeof content.document === 'object');
}

// Helper function to convert MessageContent to ChatCompletionContentPart
function convertToContentPart(content: MessageContent | DocumentContent): ChatCompletionContentPart {
  if (isMessageContent(content)) {
    if (content.type === 'text') {
      return {
        type: 'text',
        text: content.text || ''
      } as ChatCompletionContentPartText;
    } else if (content.type === 'image_url' && content.image_url) {
      return {
        type: 'image_url',
        image_url: {
          url: content.image_url.url,
          detail: content.image_url.detail || 'low'
        }
      };
    }
  } else if (isDocumentContent(content)) {
    return {
      type: 'text',
      text: content.document ? 
        `${content.text}\n\nDocument: ${content.document.text}` : 
        content.text
    } as ChatCompletionContentPartText;
  }
  
  throw new Error(`Unsupported content type`);
}

// Add these type definitions if not already present
interface UserMessage {
  role: 'user';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
      detail?: string;
    };
  }>;
}

// Add this validation function
function isValidUserMessage(message: any): message is UserMessage {
  if (!message || typeof message !== 'object') return false;
  
  if (message.role !== 'user') return false;
  
  if (!Array.isArray(message.content)) return false;
  
  return message.content.every((content: UserMessage['content'][0]) => {  
    if (!content || typeof content !== 'object') return false;
    
    if (content.type === 'text') {
      return typeof content.text === 'string' && content.text.trim() !== '';
    }
    
    if (content.type === 'image_url') {
      return content.image_url && 
             typeof content.image_url.url === 'string' &&
             (!content.image_url.detail || typeof content.image_url.detail === 'string');
    }
    
    return false;
  });
}

function createMessageParam(
  role: ValidMessageRole, 
  content: string | MessageContent | MessageContent[] | DocumentContent
): ChatCompletionMessageParam {
  switch (role) {
    case 'system':
      return { 
        role: 'system', 
        content: typeof content === 'string' ? content : JSON.stringify(content) 
      };
    case 'user':
      const userMessage = {
        role: 'user',
        content: typeof content === 'string' ? [{ 
          type: 'text', 
          text: content 
        }] : Array.isArray(content) ? content.map(convertToContentPart) : [convertToContentPart(content)]
      };
      
      // Validate the message format before returning
      if (!isValidUserMessage(userMessage)) {
        console.error('Invalid user message format:', userMessage);
        throw new Error('Invalid user message format');
      }
      
      return userMessage as ChatCompletionUserMessageParam;
    case 'assistant':
      return { 
        role: 'assistant', 
        content: typeof content === 'string' ? content : 
          Array.isArray(content) ? content[0]?.text || '' : 
          isDocumentContent(content) ? content.text : 
          content.text || ''
      };
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}

export function processMessages(
  messages: ChatMessage[],
  prompt: string,
  dominationField: string,
  imageFile?: string
): ChatCompletionMessageParam[] {
  const validMessages = messages.filter(msg => 
    msg.content && (typeof msg.content === 'string' ? msg.content.trim() !== '' : true)
  );

  const apiMessages: ChatCompletionMessageParam[] = [
    createMessageParam('system', getSystemMessage(dominationField)),
    createMessageParam('user', prompt),
    ...validMessages.map(msg => createMessageParam(msg.role as ValidMessageRole, msg.content))
  ];

  if (imageFile) {
    addImageToMessage(apiMessages[apiMessages.length - 1], imageFile);
  }

  return apiMessages;
}

function addImageToMessage(
  message: ChatCompletionMessageParam, 
  imageData: string | { base64: string, url: string }
) {
  const imageContent: ChatCompletionContentPart = {
    type: 'image_url',
    image_url: {
      url: typeof imageData === 'string' ? imageData : imageData.base64,
      detail: 'low'
    }
  };

  if (typeof message.content === 'string') {
    if (message.role === 'user') {
      (message as ChatCompletionUserMessageParam).content = [
        { type: 'text', text: message.content } as ChatCompletionContentPartText,
        imageContent
      ];
    }
  } else if (Array.isArray(message.content) && message.role === 'user') {
    message.content.push(imageContent);
  }
}
