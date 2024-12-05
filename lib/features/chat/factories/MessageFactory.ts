import { MessageOptions, ChatMessage, AssistantMessageOptions } from "@/lib/types/chat/chat";

export class MessageFactory {
  static createUserMessage(content: string, chatId: string, options: MessageOptions): ChatMessage {
    if (!options.model || !options.dominationField) {
      throw new Error('Model and dominationField are required');
    }

    return {
      id: crypto.randomUUID(),
      chatId,
      messagePairId: options.messagePairId || crypto.randomUUID(),
      userContent: content,
      assistantContent: '',
      userRole: 'user',
      assistantRole: 'assistant',
      model: options.model,
      dominationField: options.dominationField,
      customPrompt: options.customPrompt ?? null,
      status: 'success',
      isStreaming: false,
      temporary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static createAssistantMessage(
    userMessage: ChatMessage, 
    content: string, 
    options: AssistantMessageOptions
  ): ChatMessage {
    if (!options.model) {
      throw new Error('Model is required for assistant message');
    }

    return {
      id: crypto.randomUUID(),
      chatId: userMessage.chatId,
      messagePairId: userMessage.messagePairId,
      userContent: userMessage.userContent,
      assistantContent: content,
      userRole: userMessage.userRole,
      assistantRole: 'assistant',
      model: options.model,
      dominationField: userMessage.dominationField,
      customPrompt: options.customPrompt ?? null,
      status: options.status,
      isStreaming: options.isStreaming || false,
      temporary: options.temporary || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static createFailedMessage(
    originalMessage: ChatMessage,
    errorMessage: string
  ): ChatMessage {
    return {
      ...originalMessage,
      id: crypto.randomUUID(),
      assistantContent: errorMessage,
      status: 'failed',
      isStreaming: false,
      temporary: false,
      updatedAt: new Date().toISOString()
    };
  }
}
