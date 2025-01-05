import { Model } from '@/lib/types';

export const AVAILABLE_MODELS: Model[] = [
  {
    id: 'llama2',
    name: 'Llama 2',
    model: 'llama2',
    provider: 'ollama',
    modified_at: new Date().toISOString(),
    size: 7000000000,
    digest: 'sha256:abc123',
    details: {
      parent_model: 'llama2',
      format: 'gguf',
      family: 'llama',
      families: ['llama'],
      parameter_size: '7B',
      quantization_level: 'Q4_K_M',
      description: 'Open source LLM from Meta',
      parameters: '7B parameters'
    },
    capabilities: ['chat', 'completion']
  }
  // Add other models as needed
]; 