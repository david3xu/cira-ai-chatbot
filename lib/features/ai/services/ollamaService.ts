import { OllamaModel } from '../types/ollama';

const OLLAMA_SERVER_URL = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434';

export class OllamaService {
  static async getModels(isServerSide = false): Promise<OllamaModel[]> {
    try {
      const url = isServerSide 
        ? `${OLLAMA_SERVER_URL}/api/tags`
        : '/api/ollama/tags';
        
      const response = await fetch(url, {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }
} 