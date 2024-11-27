import { OllamaService } from '../services/ollamaService';
import { OllamaModel, ModelOption } from '../types/ollama';

export const DEFAULT_MODEL = 'llama3:latest';

export const transformOllamaModel = (model: OllamaModel): ModelOption => {
  return {
    value: model.name,
    label: model.name.split(':')[0].replace(/[_-]/g, ' '),
    details: {
      isOllama: true,
      fullName: model.name,
      isEmbedding: model.name.toLowerCase().includes('embed'),
      ...model.details
    }
  };
};

export const getAvailableModels = async (): Promise<ModelOption[]> => {
  try {
    console.log('Fetching models from Ollama service...');
    const models = await OllamaService.getModels();
    console.log('Raw models from Ollama:', models);
    const transformed = models.map(transformOllamaModel);
    console.log('Transformed models:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

export const normalizeModelName = (name: string | undefined | null): string => {
  if (!name) return DEFAULT_MODEL;
  
  if (name.includes(':')) return name;
  
  return `${name}:latest`;
};
