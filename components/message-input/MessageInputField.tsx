import { Button } from '@/components/ui/button';
import { Send } from 'react-feather';
import TextareaAutosize from "react-textarea-autosize";

interface MessageInputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onSend: () => void;
  isLoading: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const MessageInputField: React.FC<MessageInputFieldProps> = ({
  value,
  onChange,
  onPaste,
  onSend,
  isLoading,
  onKeyDown
}) => (
  <div className="relative flex items-center w-full">
    <TextareaAutosize
      value={value}
      onChange={onChange}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
      placeholder="Send a message... (Paste screenshot with Ctrl+V)"
      className="w-full bg-gray-700 text-white rounded-lg py-2.5 px-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      minRows={1}
      maxRows={5}
    />
    <Button
      onClick={onSend}
      className="absolute right-2 text-white p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!value.trim() || isLoading}
    >
      <Send size={18} />
    </Button>
  </div>
); 