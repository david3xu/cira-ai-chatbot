import { FormattedMessage } from '@/types/messages';

const OLLAMA_SERVER_URL = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434';

export async function createOllamaCompletion(
  messages: FormattedMessage[],
  model: string,
  onToken: (token: string) => void
) {
  try {
    console.log('Initializing Ollama completion with model:', model);
    console.log('Server URL:', OLLAMA_SERVER_URL);
        
    // Format messages to handle both text and images
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: Array.isArray(msg.content) 
        ? msg.content 
        : [msg.content]
    }));

    const response = await fetch(`${OLLAMA_SERVER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' 
            ? msg.content 
            : (typeof msg.content[0] === 'object' && 'text' in msg.content[0] ? msg.content[0].text : msg.content[0]) || ''
        })),
        stream: true,
        max_tokens: 2048,
        temperature: 0.0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = ''; // Add buffer for incomplete chunks

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      buffer += chunk;
      
      // Split buffer into complete lines
      const lines = buffer.split('\n');
      // Keep the last potentially incomplete line in buffer
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            // Handle both SSE format and direct JSON
            let jsonStr = line;
            if (line.startsWith('data: ')) {
              jsonStr = line.slice(6);
            }
            
            if (jsonStr.trim() === '[DONE]') continue;
            
            const data = JSON.parse(jsonStr);
            
            // Handle different response formats
            const content = data.choices?.[0]?.delta?.content || 
                          data.response || 
                          data.choices?.[0]?.message?.content;
                          
            if (content) {
              onToken(content);
              fullResponse += content;
            }
          } catch (e) {
            // Log parsing error details but continue processing
            console.warn('Failed to parse chunk:', {
              line,
              error: e instanceof Error ? e.message : 'Unknown error',
              buffer: buffer.length
            });
          }
        }
      }
    }

    return {
      content: fullResponse,
      chat_topic: ''
    };
  } catch (error) {
    console.error('Detailed Ollama error:', error);
    if (error instanceof Error) {
      if (error.message.includes('exit status 127')) {
        throw new Error('Ollama runtime error: Please check if CUDA libraries are installed and model files are not corrupted');
      }
      throw error;
    }
    throw new Error('Unknown error occurred while communicating with Ollama server');
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
