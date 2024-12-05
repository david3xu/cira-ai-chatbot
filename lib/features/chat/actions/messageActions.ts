import { ChatService } from "@/lib/services/chat/ChatService";
import { MessageFactory } from "../factories/MessageFactory";
import { storageActions } from "@/lib/features/chat/actions/storage";
import { ChatMessage, MessageOptions } from "@/lib/types/chat/chat";

interface SendMessageOptions extends Omit<MessageOptions, 'model' | 'dominationField'> {
  model?: string;
  dominationField?: string;
}

export const messageActions = {
  updateMessage: async (message: ChatMessage): Promise<void> => {
    await Promise.all([
      ChatService.saveMessage(message),
      storageActions.database.saveMessage(message)
    ]);
  },
  
  createAndSendMessage: async (content: string, chatId: string, options: SendMessageOptions): Promise<ChatMessage> => {
    if (!options.model || !options.dominationField) {
      throw new Error('Model and dominationField are required');
    }

    const messageOptions: MessageOptions = {
      model: options.model,
      dominationField: options.dominationField,
      messagePairId: options.messagePairId,
      customPrompt: options.customPrompt,
      metadata: options.metadata,
      status: options.status
    };

    const message = MessageFactory.createUserMessage(content, chatId, messageOptions);
    await messageActions.updateMessage(message);
    return message;
  }
};
