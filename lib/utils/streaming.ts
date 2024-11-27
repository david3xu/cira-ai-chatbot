interface StreamingHandlers {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError?: (error: Error) => void;
}

export async function handleStreamingResponse(
  response: Response,
  handlers: StreamingHandlers
) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No reader available');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        if (line.startsWith('data: ')) {
          const jsonString = line.slice(6).trim();
          if (jsonString === '[DONE]') {
            handlers.onComplete();
            return;
          }

          try {
            const data = JSON.parse(jsonString);
            
            if (data.error) {
              handlers.onError?.(new Error(data.error));
              return;
            }
            
            if (data.done) {
              if (data.fullResponse) {
                handlers.onToken(data.fullResponse);
              }
              handlers.onComplete();
              return;
            }
            
            // Handle different response formats
            if (typeof data === 'string') {
              handlers.onToken(data);
            } else if (data.token) {
              handlers.onToken(data.token);
            } else if (data.content) {
              handlers.onToken(data.content);
            }
          } catch (e) {
            console.warn('Error parsing SSE data:', e, 'Raw data:', jsonString);
            // Continue processing other chunks
            continue;
          }
        }
      }
    }
    
    handlers.onComplete();
  } catch (error) {
    console.error('Error in streaming response:', error);
    handlers.onError?.(error as Error);
  } finally {
    reader.releaseLock();
  }
} 