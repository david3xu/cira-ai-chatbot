/**
 * DocumentToolbar Component
 * 
 * Toolbar for document controls:
 * - Zoom controls
 * - Download
 * - Print
 * - Search
 */

import { Download, Printer, Search, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DocumentToolbar() {
  return (
    <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 p-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
