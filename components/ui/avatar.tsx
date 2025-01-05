import { cn } from '@/lib/utils/utils';
import { User, Bot } from 'lucide-react';

interface AvatarProps {
  isUser?: boolean;
  className?: string;
}

export function Avatar({ isUser, className }: AvatarProps) {
  return (
    <div className={cn(
      'flex items-center justify-center w-10 h-10 rounded-full shadow-md mr-2',
      isUser 
        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
        : 'bg-gradient-to-br from-gray-600 to-gray-700',
      className
    )}>
      {isUser ? (
        <User className="h-6 w-6 text-white" />
      ) : (
        <Bot className="h-6 w-6 text-white" />
      )}
    </div>
  );
} 