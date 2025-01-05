import { ApiService } from './base/ApiService';
import type { Model, ModelConfig } from '@/lib/types';

export class ModelService extends ApiService {
  static async getModels(): Promise<Model[]> {
    const response = await this.get<{
      object: string;
      data: Array<{
        id: string;
        object: string;
        created: number;
        owned_by: string;
      }>;
    }>('/api/ai/models');
    
    console.log('API Response:', response); // Debug log
    
    if (!response?.data) {
      console.warn('No models found in response');
      return [];
    }
    
    return response.data.map(model => ({
      id: model.id,
      name: model.id.split(':')[0], // Remove ":latest" suffix
      model: model.id,
      provider: 'ollama',
      modified_at: new Date(model.created * 1000).toISOString(),
      size: 0,
      digest: '',
      details: {
        parent_model: '',
        format: '',
        family: '',
        families: [],
        parameter_size: '0B',
        quantization_level: '',
        description: '',
        parameters: ''
      },
      capabilities: ['chat', 'completion']
    }));
  }

  static async getModel(modelId: string): Promise<Model> {
    return this.get<Model>(`/api/ai/models/${modelId}`);
  }

  static async switchModel(chatId: string, modelId: string): Promise<void> {
    return this.post('/api/ai/models/switch', { chatId, modelId });
  }

  static async getModelConfig(chatId: string): Promise<ModelConfig> {
    return this.get<ModelConfig>(`/api/ai/models/${chatId}/settings`);
  }

  static async updateModelConfig(modelId: string, config: Partial<ModelConfig>): Promise<ModelConfig> {
    return this.put<ModelConfig>(`/api/ai/models/${modelId}/settings`, config);
  }
} 