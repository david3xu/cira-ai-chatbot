// Types
export interface StreamingOptions {
  onToken: (token: string) => Promise<void>;
  onComplete?: () => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}

export interface StreamResponse {
  content?: string;
  error?: string;
  done?: boolean;
}

export interface StreamingState {
  isStreaming: boolean;
  content: string;
  error: string | null;
}

// Implementation
export async function handleStreamingResponse(
  response: Response,
  options: StreamingOptions
) {
  if (!response.body) {
    throw new Error('No response body received');
  }

  let hasReceivedContent = false;
  
  try {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (buffer.trim()) {
          await options.onToken(buffer);
          hasReceivedContent = true;
        }
        break;
      }

      // Decode and process the chunk
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete JSON objects
      try {
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line) as StreamResponse;
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.content) {
                await options.onToken(parsed.content);
                hasReceivedContent = true;
              }
            } catch (jsonError) {
              // If it's not valid JSON, try to use the line as plain text
              if (line.trim()) {
                await options.onToken(line);
                hasReceivedContent = true;
              }
            }
          }
        }
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          // If it's a JSON parsing error, continue collecting more data
          continue;
        }
        throw parseError; // Re-throw other errors
      }
    }

    if (!hasReceivedContent) {
      throw new Error('No content received from stream');
    }

    await options.onComplete?.();
  } catch (error) {
    console.error('Error in streaming response:', error);
    if (options.onError) {
      await options.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

export function createStreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export function handleStreamError(
  error: Error,
  setError: (error: string | null) => void,
  context: string
) {
  console.error(`Error in ${context}:`, error);
  let errorMessage = 'An unexpected error occurred';

  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else {
      errorMessage = error.message;
    }
  }

  setError(errorMessage);
  return errorMessage;
} 