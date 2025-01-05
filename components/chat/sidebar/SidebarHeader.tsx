import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SidebarHeaderProps {
  onClose: () => void;
  isMobile: boolean;
  visible: boolean;
}

export function SidebarHeader({ onClose, isMobile, visible }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between h-[60px] px-4 border-b border-gray-700">
      <h2 className="text-xl font-semibold text-white">Chats</h2>
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
