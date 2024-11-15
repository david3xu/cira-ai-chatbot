import { ChatMessage } from '@/lib/chat';
import { v4 as uuidv4 } from 'uuid';
import { encodeImageToBase64 } from '@/lib/utils/file';
import { answerQuestion } from '@/actions/ai';
import { storeChatMessage } from './storeMessage';
import { MessageContent, FormattedMessage } from '@/types/messages';
import { generateChatTopic } from '@/lib/utils/chatTopicGenerator';
import { supabase } from '@/lib/supabase';

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
    // Get AI response first
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

    // Generate chat topic
    const chatTopic = generateChatTopic(message, aiResponse.content);

    // Store both messages in a single row
    const messageData = {
      id: uuidv4(),
      chat_id: chatId,
      message_pair_id: uuidv4(),
      domination_field: dominationField,
      image_url: imageFile && typeof imageFile === 'string' ? imageFile : undefined,
      created_at: new Date().toISOString(),
      user_content: message,
      assistant_content: aiResponse.content,
      user_role: 'user',
      assistant_role: 'assistant',
      chat_topic: chatTopic
    };

    const { data, error } = await supabase
      .from('chat_history')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    // Return formatted messages for immediate display
    return {
      userMessage: {
        id: data.id,
        role: 'user',
        content: message,
        dominationField,
        image: messageData.image_url,
        created_at: messageData.created_at
      },
      assistantMessage: {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse.content,
        dominationField,
        created_at: messageData.created_at
      }
    };
  } catch (error) {
    console.error('Error in sendMessageToDatabase:', error);
    throw error;
  }
}

