import { FormattedMessage } from '@/types/messages';

const OLLAMA_SERVER_URL = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434';

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_SERVER_URL}/api/version`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Ollama health check failed:', error);
    return false;
  }
}

export async function createOllamaCompletion(
  messages: FormattedMessage[],
  model: string,
  onToken: (token: string) => void
) {
  try {
    // Skip health check since we know the completions endpoint works
    const response = await fetch(`${OLLAMA_SERVER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: Array.isArray(msg.content) 
            ? msg.content[0] && typeof msg.content[0] === 'object' && 'text' in msg.content[0]
              ? msg.content[0].text
              : ''
            : msg.content
        })),
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const jsonStr = line.startsWith('data: ') ? line.slice(6) : line;
            
            if (jsonStr.trim() === '[DONE]') continue;
            
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content || data.response;
            if (content) {
              onToken(content);
              fullResponse += content;
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', line);
          }
        }
      }
    }

    return {
      content: fullResponse,
      chat_topic: ''
    };
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to Ollama server. Please ensure the server is running at ' + OLLAMA_SERVER_URL);
    }
    console.error('Detailed error:', error);
    throw error;
  }
}

export async function listModels() {
  const response = await fetch(`${OLLAMA_SERVER_URL}/v1/models`);
  return response.json();
}

export async function getModel(modelName: string) {
  const response = await fetch(`${OLLAMA_SERVER_URL}/v1/models/${modelName}`);
  return response.json();
}

export async function createEmbeddings(input: string | string[], model = "all-minilm") {
  const response = await fetch(`${OLLAMA_SERVER_URL}/v1/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input,
    })
  });
  return response.json();
}
