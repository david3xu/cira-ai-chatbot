'use client';

import React, { memo, useCallback } from 'react';
import { useChatDomain } from '@/lib/hooks/domain/useChatDomain';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DOMINATION_FIELDS } from '@/lib/features/ai/config/constants';

export const DomainSelector = memo(function DomainSelector() {
  const { state, actions } = useChatDomain();

  const handleDomainChange = useCallback((value: string) => {
    if (value !== state.dominationField) {
      actions.setDominationField(value);
      localStorage.setItem('selectedDominationField', value);
    }
  }, [state.dominationField, actions]);

  return (
    <div className="p-4">
      <label className="block text-sm font-medium text-gray-200 mb-2">
        Domain
      </label>
      <Select value={state.dominationField} onValueChange={handleDomainChange}>
        <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700">
          <SelectValue placeholder="Select a domain" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(DOMINATION_FIELDS).map((value) => (
            <SelectItem key={value} value={value} className="text-white hover:bg-gray-700">
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}); 