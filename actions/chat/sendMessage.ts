import { ChatMessage } from '@/lib/chat';
import { v4 as uuidv4 } from 'uuid';
import { encodeImageToBase64 } from '@/lib/utils/file';
import { answerQuestion } from '@/actions/ai';
import { storeChatMessage } from './storeMessage';
import { MessageContent, FormattedMessage } from '@/types/messages';
import { generateChatTopic } from '@/lib/utils/chatTopicGenerator';

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
  try {
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
  } catch (error) {
    console.error('Error processing assistant response:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to process assistant response'
    );
  }
}

export async function sendMessageToDatabase(
  message: string,
  chatId: string,
  dominationField: string,
  currentMessages: ChatMessage[],
  imageFile?: File | string
) {
  try {
    // Create and store user message using helper function
    const userMessage = createUserMessage(message, dominationField);
    const userMessageResult = await storeChatMessage(
      chatId,
      'user',
      userMessage.content as string,
      dominationField,
      imageFile
    );

    if (!userMessageResult) throw new Error('Failed to store user message');

    // Get AI response
    const imageBase64 = imageFile && imageFile instanceof File 
      ? await encodeImageToBase64(imageFile) 
      : imageFile as string | undefined;
    const aiResponse = await answerQuestion({
      message,
      chatHistory: currentMessages,
      dominationField,
      chatId,
      imageBase64,
    });

    // Generate chat topic and create assistant message
    const chatTopic = generateChatTopic(message, aiResponse.content);
    const assistantMessage = createAssistantMessage(
      aiResponse.content, 
      dominationField,
      chatTopic
    );

    // Store assistant message
    const assistantMessageResult = await storeChatMessage(
      chatId,
      'assistant',
      assistantMessage.content as string,
      dominationField,
      undefined,
      chatTopic
    );

    if (!assistantMessageResult) throw new Error('Failed to store assistant message');

    return {
      userMessage: userMessageResult,
      assistantMessage: assistantMessageResult
    };
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

