import { getEmbedding } from '@/lib/features/ai/utils/embedding';

interface EmbeddingWithMetadata {
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export class EmbeddingService {
  static async createEmbeddings(
    texts: string[],
    metadata?: Record<string, any>[]
  ): Promise<EmbeddingWithMetadata[]> {
    const embeddings = await Promise.all(
      texts.map(async (text, index) => ({
        text,
        embedding: await getEmbedding(text),
        metadata: metadata?.[index]
      }))
    );

    return embeddings;
  }
} 