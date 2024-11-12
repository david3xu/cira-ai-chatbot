const OLLAMA_SERVER_URL = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434';

export async function getOllamaModels(options?: {
  cache?: boolean;
  headers?: Record<string, string>;
}) {
  try {
    const response = await fetch(`${OLLAMA_SERVER_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...(options?.cache ? {
        next: { revalidate: 60 }
      } : {
        cache: 'no-store'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.models || !Array.isArray(data.models)) {
      return [];
    }

    return data.models
      .filter((model: any) => model && model.name)
      .map((model: any) => ({
        value: model.name,
        label: `${model.name} (${model.details?.parameter_size || 'Unknown size'})`,
        details: model.details || {}
      }));
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}


