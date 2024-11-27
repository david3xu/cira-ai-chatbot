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
    const response = await fetch('/api/ollama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: inputs[0], // Ollama currently supports single input
        model: `${model}:latest`
      })
    });

    if (!response.ok) {
      throw new Error('Ollama embedding request failed');
    }

    const data = await response.json();
    return {
      embeddings: [data.embedding],
      model,
    };
  }

  private static async createOpenAIEmbedding(
    inputs: string[],
    model: string
  ): Promise<EmbeddingResponse> {
    const response = await fetch('/api/embeddings', {
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