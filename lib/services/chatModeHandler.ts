import { ChatMessage } from "../chat";
import { ProcessedDocument } from "./types";
import { ChatService } from "../services/chatService";

interface ChatModeConfig {
  type: 'text' | 'image' | 'document';
  contextBuilder: (content: any) => Promise<string>;
  messageFormatter: (content: any) => ChatMessage;
}

export class ChatModeHandler {
  private static modes: Record<string, ChatModeConfig> = {
    text: {
      type: 'text',
      contextBuilder: async (content: string) => content,
      messageFormatter: (content: string) => ({
        role: 'user',
        content,
        type: 'text',
        id: crypto.randomUUID(),
        dominationField: '0'
      })
    },
    image: {
      type: 'image',
      contextBuilder: async (_image: string) => {
        return `Analyzing image content. Please describe what you see in the image.`;
      },
      messageFormatter: (content: { text: string, image: string }) => ({
        role: 'user',
        content: content.text,
        image: content.image,
        type: 'image',
        id: crypto.randomUUID(),
        dominationField: '0'
      })
    },
    document: {
      type: 'document',
      contextBuilder: async (document: ProcessedDocument) => {
        return ChatService.prepareDocumentContext(document);
      },
      messageFormatter: (content: { text: string, document: ProcessedDocument }) => ({
        role: 'user',
        content: content.text,
        document: {
          text: content.document.text,
          metadata: {
            ...content.document.metadata,
            previewUrl: content.document.metadata.previewUrl
          }
        },
        type: 'document',
        id: crypto.randomUUID(),
        dominationField: '0'
      })
    }
  };

  static async processChat(
    mode: 'text' | 'image' | 'document',
    content: any,
    message: string
  ): Promise<ChatMessage> {
    const config = this.modes[mode];
    if (!config) {
      throw new Error(`Unsupported chat mode: ${mode}`);
    }

    const context = await config.contextBuilder(content);
    return config.messageFormatter({
      text: context + "\n\n" + message,
      ...content
    });
  }

  static formatDocumentPreview(document: ProcessedDocument) {
    return {
      fileName: document.metadata.fileName,
      previewUrl: document.metadata.previewUrl,
      metadata: {
        fileName: document.metadata.fileName,
        fileType: document.contentType,
        fileSize: document.metadata.fileSize,
        previewUrl: document.metadata.previewUrl
      }
    };
  }
} 