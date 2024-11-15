import { ChatMessage } from "@/types/messages";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isStreaming = false 
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'} ${isStreaming ? 'streaming' : ''}`}>
      <div className="message-content">
        {message.image && (
          <div className="message-image">
            <img src={message.image} alt="User uploaded" />
          </div>
        )}
        <div className="message-text">
          {typeof message.content === 'string' ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            JSON.stringify(message.content)
          )}
        </div>
        {message.model && (
          <div className="message-metadata">
            <span className="model-tag">{message.model}</span>
          </div>
        )}
      </div>
    </div>
  );
}; 