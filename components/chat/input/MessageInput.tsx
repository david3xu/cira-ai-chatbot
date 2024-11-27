import { useState, useRef, forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Paperclip } from 'lucide-react';
import { ImagePreview } from './ImagePreview';
import { DocumentPreview } from './DocumentPreview';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useChatMessage } from '@/lib/features/chat/hooks/useChatMessage';
import { useChatSidebar } from '@/lib/features/chat/hooks/useChatSidebar';
import ReactDOM from 'react-dom';

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="text-red-500">
    Error sending message. Please try again.
  </div>
);

const InputButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button {...props} ref={ref} />
  )
);
InputButton.displayName = 'InputButton';

export function MessageInput() {
  const { handleMessage, error, setError } = useChatMessage();
  const { createNewChat, setCurrentChat, currentChat, model, dominationField } = useChatSidebar();
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();
    if (!currentMessage && files.length === 0) return;

    try {
      setIsLoading(true);
      let chatToUse = currentChat;
      
      if (!currentChat) {
        const newChat = await createNewChat({
          model: model || 'llama3.1',
          dominationField: dominationField || 'Normal Chat',
          source: 'input',
          name: `Chat - ${new Date().toLocaleString()}`,
          metadata: {
            source: 'message_input',
            initialMessage: currentMessage.slice(0, 50)
          }
        });

        if (!newChat?.id) {
          throw new Error('Failed to create chat: Invalid chat data');
        }

        chatToUse = newChat;

        // Update state and storage synchronously
        setCurrentChat(chatToUse);
        const chatData = JSON.stringify(chatToUse);
        localStorage.setItem(`chat_${chatToUse.id}`, chatData);
        sessionStorage.setItem(`chat_${chatToUse.id}`, chatData);

        // Wait for next tick to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      if (!chatToUse?.id) {
        throw new Error('Invalid chat state: Missing chat ID');
      }

      // Pass chat data directly to handleMessage
      await handleMessage(currentMessage, {
        chatId: chatToUse.id,
        model: model || 'llama3.1',
        dominationField: dominationField || 'Normal Chat'
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="bg-gray-900 p-4">
        <div className="mx-auto">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((file, index) => (
                file.type.startsWith('image/') ? (
                  <ImagePreview
                    key={index}
                    file={file}
                    onRemove={() => handleRemoveFile(index)}
                  />
                ) : (
                  <DocumentPreview
                    key={index}
                    file={file}
                    onRemove={() => handleRemoveFile(index)}
                  />
                )
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            
            <div className="relative flex items-center">
              <InputButton
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute left-2 bottom-2 z-10"
              >
                <Paperclip className="h-4 w-4" />
              </InputButton>
              
              <Textarea
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="min-h-[60px] w-full bg-gray-800 text-white resize-none pl-12 pr-12"
                rows={1}
                disabled={isLoading}
              />
              
              <InputButton 
                type="submit" 
                size="sm" 
                disabled={isLoading}
                className="absolute right-2 bottom-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </InputButton>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
} 


