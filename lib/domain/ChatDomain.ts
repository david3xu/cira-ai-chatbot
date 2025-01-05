import type { ChatStreamOptions } from '@/lib/types';

export class ChatDomain {
  static createMessagePayload(content: string, role: string = 'user') {
    return { content, role };
  }

  static createStreamPayload(content: string, options: ChatStreamOptions = {}) {
    return {
      message: this.createMessagePayload(content),
      model: options.model,
      dominationField: options?.dominationField,
      customPrompt: options?.customPrompt
    };
  }
} 