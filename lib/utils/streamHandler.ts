export const handleStreamResponse = async (
  response: ReadableStream | Response,
  onToken: (token: string) => void
) => {
  const reader = response instanceof Response ? response.body!.getReader() : response.getReader();
  const decoder = new TextDecoder();
  let streamedResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.token) {
            streamedResponse += data.token;
            onToken(data.token);
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      }
    }
  }

  return streamedResponse;
}; 