import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DOMINATION_FIELDS, DominationField } from '@/lib/features/ai/config/constants';

interface DomainFieldSelectorProps {
  value: DominationField;
  onChange: (value: DominationField) => void;
}

export function DomainFieldSelector({ value, onChange }: DomainFieldSelectorProps) {
  const handleChange = useCallback((newValue: string) => {
    onChange(newValue as DominationField);
  }, [onChange]);

  return (
    <div className="px-4 h-[60px] flex items-center">
      <Select 
        value={value || DOMINATION_FIELDS.NORMAL_CHAT} 
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700">
          <SelectValue>
            {value || DOMINATION_FIELDS.NORMAL_CHAT}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {Object.values(DOMINATION_FIELDS).map((value) => (
            <SelectItem 
              key={value} 
              value={value}
              className="text-white hover:bg-gray-700 cursor-pointer"
            >
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
