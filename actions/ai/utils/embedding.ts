import { EmbeddingService } from '@/lib/services/embeddingService';
export const performHybridSearch = EmbeddingService.performHybridSearch.bind(EmbeddingService);
export const getEmbedding = EmbeddingService.getSingleEmbedding.bind(EmbeddingService);
export default EmbeddingService;
