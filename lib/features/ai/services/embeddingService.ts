/**
 * Embedding Service
 * 
 * Manages text embeddings with:
 * - Multiple model support
 * - Provider selection
 * - Error handling
 * - Usage tracking
 * 
 * Features:
 * - Ollama integration
 * - OpenAI compatibility
 * - Batch processing
 * - Error recovery
 * - Usage monitoring
 */

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class EmbeddingService {
  static async createEmbedding(
    text: string | string[],
    model: string = 'mxbai-embed-large'
  ): Promise<EmbeddingResponse> {
    const isOllamaModel = model.includes('mxbai') || model === 'all-minilm';
    const inputs = Array.isArray(text) ? text : [text];

    try {
      if (isOllamaModel) {
        return await this.createOllamaEmbedding(inputs, model);
      } else {
        return await this.createOpenAIEmbedding(inputs, model);
      }
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  private static async createOllamaEmbedding(
    inputs: string[],
    model: string
  ): Promise<EmbeddingResponse> {
    const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434';
    
    // Process all inputs in parallel
    const embeddings = await Promise.all(inputs.map(async (input) => {
      const response = await fetch(`${ollamaUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          model: `${model}:latest`
        })
      });

      if (!response.ok) {
        throw new Error('Ollama embedding request failed');
      }

      const data = await response.json();
      return data.embedding;
    }));

    return {
      embeddings,
      model,
    };
  }

  private static async createOpenAIEmbedding(
    inputs: string[],
    model: string
  ): Promise<EmbeddingResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: inputs,
        model
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI embedding request failed');
    }

    const data = await response.json();
    return {
      embeddings: data.data.map((item: any) => item.embedding),
      model,
      usage: data.usage
    };
  }
} 