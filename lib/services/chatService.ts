import { ProcessedDocument } from "@/lib/services/types";

interface ChatWithDocumentOptions {
  message: string;
  document: ProcessedDocument;
  dominationField: string;
  chatId: string;
}

export class ChatService {
  static async chatWithDocument({ 
    message, 
    document, 
    dominationField,
    chatId 
  }: ChatWithDocumentOptions) {
    try {
      const response = await fetch('/api/documentChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: this.prepareDocumentContext(document)
            },
            { 
              role: 'user', 
              content: message,
              document: {
                text: document.text,
                metadata: document.metadata
              }
            }
          ],
          dominationField,
          documentInfo: {
            type: document.contentType,
            fileName: document.metadata.fileName,
            content: document.text
          },
          chatId
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      return response.json();
    } catch (error) {
      console.error('Error in chatWithDocument:', error);
      throw error;
    }
  }

  static async sendMessage(message: string) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    return response.json();
  }

  public static prepareDocumentContext(document: ProcessedDocument): string {
    switch (document.contentType) {
      case 'pdf':
        return `Analyzing PDF: "${document.metadata.fileName}" (${document.metadata.pageCount} pages)`;
      case 'image':
        return `Analyzing image: "${document.metadata.fileName}"`;
      case 'markdown':
        return `Analyzing markdown: "${document.metadata.fileName}"`;
      default:
        return `Analyzing document: "${document.metadata.fileName}"`;
    }
  }
} 