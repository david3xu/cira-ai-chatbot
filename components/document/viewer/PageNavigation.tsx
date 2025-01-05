/**
 * PageNavigation Component
 * 
 * Handles document page navigation:
 * - Page numbers
 * - Next/Previous
 * - Jump to page
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function PageNavigation({
  currentPage,
  totalPages,
  onPageChange
}: PageNavigationProps) {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 border-t border-gray-700 bg-gray-900 p-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={currentPage}
          onChange={(e) => handlePageChange(parseInt(e.target.value))}
          className="w-16 text-center"
          min={1}
          max={totalPages}
        />
        <span className="text-sm text-gray-400">
          of {totalPages}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
