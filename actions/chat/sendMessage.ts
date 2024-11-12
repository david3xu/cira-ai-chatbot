import { ChatMessage } from '@/lib/chat';
import { v4 as uuidv4 } from 'uuid';
import { encodeImageToBase64 } from '@/lib/utils/file';
import { answerQuestion } from '@/actions/ai';
import { storeChatMessage } from './storeMessage';
import { MessageContent, FormattedMessage } from '@/types/messages';

interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

interface AssistantResponse {
  fullResponse: string;
  chat_topic: string;
}

async function processAssistantResponse(
  message: string,
  currentMessages: ChatMessage[],
  dominationField: string,
  chatId: string,
  customPrompt: string | undefined,
  imageBase64: string | undefined,
  model: string,
  onToken?: (token: string) => void
): Promise<AssistantResponse> {
  const response = await answerQuestion({
    message,
    chatHistory: currentMessages,
    dominationField,
    chatId,
    customPrompt,
    imageBase64,
    model,
    onToken: onToken || ((token: string) => {})
  });

  return {
    fullResponse: response.content,
    chat_topic: response.chat_topic || message.substring(0, 50)
  };
}

export async function handleSendMessage(
  message: string | { content: MessageContent[] },
  imageFile: File | undefined,
  dominationField: string,
  customPrompt: string | undefined,
  chatId: string,
  currentMessages: ChatMessage[],
  historyLoaded: boolean,
  model: string,
  onToken?: (token: string) => void
): Promise<SendMessageResponse | undefined> {
  let messageContent: string;
  
  if (typeof message === 'string') {
    messageContent = message;
  } else if (Array.isArray(message.content)) {
    const textItem = message.content.find((item: MessageContent) => item.type === 'text');
    messageContent = textItem?.text || '';
  } else if (typeof message === 'object' && message?.content) {
    messageContent = typeof message.content === 'string' ? message.content : '';
  } else {
    messageContent = String(message || '');
  }

  if (!dominationField) return undefined;
  
  const imageBase64 = imageFile ? await encodeImageToBase64(imageFile) : undefined;
  const userMessage = createUserMessage(messageContent.trim(), dominationField, imageBase64);
  
  try {
    await storeChatMessage(
      chatId,
      'user',
      { text: messageContent.trim() || ' ' },
      dominationField,
      imageFile,
      undefined,
      true
    );
  } catch (error) {
    console.warn('Failed to store message, continuing with chat:', error);
  }

  try {
    const { fullResponse, chat_topic } = await processAssistantResponse(
      messageContent.trim(),
      currentMessages,
      dominationField,
      chatId,
      customPrompt,
      imageBase64,
      model,
      onToken
    );

    const assistantMessage = createAssistantMessage(fullResponse, dominationField, chat_topic);
    
    try {
      await storeChatMessage(
        chatId,
        'assistant',
        fullResponse,
        dominationField,
        undefined,
        chat_topic,
        true
      );
    } catch (error) {
      console.warn('Failed to store assistant message:', error);
    }

    return { userMessage, assistantMessage };
  } catch (error) {
    console.error('Error in handleSendMessage:', error);
    throw error;
  }
}

const createUserMessage = (message: string, dominationField: string, imageBase64?: string): ChatMessage => ({
  id: uuidv4(),
  role: 'user',
  content: message,
  dominationField,
  image: imageBase64,
});

const createAssistantMessage = (content: string, dominationField: string, chat_topic: string): ChatMessage => ({
  id: uuidv4(),
  role: 'assistant',
  content,
  dominationField,
  chat_topic,
});

