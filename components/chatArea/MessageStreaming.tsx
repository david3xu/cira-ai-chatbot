import { useRef, useCallback, useEffect } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface StreamingState {
  content: string;
  isComplete: boolean;
  error: string | null;
  chunks: string[];
  lastUpdateTime: number;
}

export const MessageStreaming: React.FC<{
  onComplete: (content: string) => void;
  onError: (error: string) => void;
}> = ({ onComplete, onError }) => {
  // State management for streaming
  const [streamingState, setStreamingState] = useState<StreamingState>({
    content: '',
    isComplete: false,
    error: null,
    chunks: [],
    lastUpdateTime: Date.now()
  });

  // Refs for managing updates
  const contentBuffer = useRef<string[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const processingLock = useRef<boolean>(false);

  // Process incoming stream chunks
  const processStreamChunk = useCallback((chunk: string) => {
    if (processingLock.current) {
      contentBuffer.current.push(chunk);
      return;
    }

    processingLock.current = true;

    try {
      setStreamingState(prev => {
        const newChunks = [...prev.chunks, chunk];
        const newContent = newChunks.join('');

        return {
          ...prev,
          content: newContent,
          chunks: newChunks,
          lastUpdateTime: Date.now()
        };
      });
    } finally {
      processingLock.current = false;
    }

    // Process any buffered chunks
    if (contentBuffer.current.length > 0) {
      const nextChunk = contentBuffer.current.shift();
      if (nextChunk) {
        processStreamChunk(nextChunk);
      }
    }
  }, []);

  // Handle stream completion
  const completeStreaming = useCallback(() => {
    setStreamingState(prev => ({
      ...prev,
      isComplete: true
    }));

    onComplete(streamingState.content);
  }, [onComplete, streamingState.content]);

  // Move setupStream outside useEffect and memoize it
  const setupStream = useCallback(async () => {
    try {
      const eventSource = new EventSource('/api/chat/stream');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'content') {
          processStreamChunk(data.content);
        } else if (data.type === 'complete') {
          completeStreaming();
        }
      };

      eventSource.onerror = (error) => {
        console.error('Streaming error:', error);
        setStreamingState(prev => ({
          ...prev,
          error: 'Connection error occurred'
        }));
        onError('Streaming connection failed');
        eventSource.close();
      };

    } catch (error) {
      console.error('Stream setup error:', error);
      setStreamingState(prev => ({
        ...prev,
        error: 'Failed to setup streaming'
      }));
      onError('Failed to initialize streaming');
    }
  }, [processStreamChunk, completeStreaming, onError]);

  // Modify useEffect to use the lifted setupStream
  useEffect(() => {
    let eventSource: EventSource;
    
    setupStream();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      contentBuffer.current = [];
      processingLock.current = false;
    };
  }, [setupStream]);

  // Render streaming content
  return (
    <div className="streaming-message">
      {streamingState.error ? (
        <div className="error-message">
          {streamingState.error}
          <button 
            onClick={setupStream}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      ) : (
        <ReactMarkdown>{streamingState.content}</ReactMarkdown>
      )}
      {!streamingState.isComplete && !streamingState.error && (
        <div className="loading-indicator">
          <span className="dots-animation">...</span>
        </div>
      )}
    </div>
  );
}; 