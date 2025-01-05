// import { OllamaModel } from '../types/ollama';

// const OLLAMA_SERVER_URL = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434';

// interface Message {
//   role: 'user' | 'system' | 'assistant';
//   content: string;
// }

// interface CompletionOptions {
//   messages: Message[];
//   model: string;
//   temperature?: number;
//   maxTokens?: number;
// }

// interface CompletionResponse {
//   response: string;
//   model: string;
//   created_at: string;
// }

// interface EmbeddingOptions {
//   model: string;
//   prompt: string;
// }

// interface EmbeddingResponse {
//   embedding: number[];
//   model: string;
// }

// /**
//  * Ollama Service
//  * 
//  * Manages Ollama model operations:
//  * - Model listing
//  * - Server communication
//  * - Error handling
//  * - Cache control
//  * 
//  * Features:
//  * - Server/client handling
//  * - Model fetching
//  * - Error recovery
//  * - Cache management
//  * - Environment configuration
//  */
// export class OllamaService {
//   static async getModels(isServerSide = false): Promise<OllamaModel[]> {
//     try {
//       const url = isServerSide 
//         ? `${OLLAMA_SERVER_URL}/api/tags`
//         : '/api/ollama/tags';
        
//       const response = await fetch(url, {
//         headers: { 
//           'Content-Type': 'application/json',
//           'Cache-Control': 'no-cache'
//         }
//       });

//       if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);
//       const data = await response.json();
//       return data.models || [];
//     } catch (error) {
//       console.error('Error fetching Ollama models:', error);
//       return [];
//     }
//   }

//   private static readonly API_BASE_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

//   static async createCompletion(options: CompletionOptions): Promise<CompletionResponse> {
//     const response = await fetch(`${this.API_BASE_URL}/api/generate`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: options.model,
//         prompt: this.formatMessages(options.messages),
//         temperature: options.temperature,
//         max_tokens: options.maxTokens,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Ollama API error: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return {
//       response: data.response,
//       model: data.model,
//       created_at: new Date().toISOString(),
//     };
//   }

//   static async createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse> {
//     const response = await fetch(`${this.API_BASE_URL}/api/embeddings`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: options.model,
//         prompt: options.prompt,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Ollama API error: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return {
//       embedding: data.embedding,
//       model: data.model,
//     };
//   }

//   private static formatMessages(messages: Message[]): string {
//     return messages
//       .map(msg => {
//         switch (msg.role) {
//           case 'system':
//             return `System: ${msg.content}`;
//           case 'assistant':
//             return `Assistant: ${msg.content}`;
//           case 'user':
//             return `User: ${msg.content}`;
//           default:
//             return msg.content;
//         }
//       })
//       .join('\n');
//   }
// } 