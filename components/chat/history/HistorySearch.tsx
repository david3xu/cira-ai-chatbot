'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface HistorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function HistorySearch({ value, onChange }: HistorySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search history..."
        className="pl-9 pr-4"
      />
    </div>
  );
} 