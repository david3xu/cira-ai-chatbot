'use client';

import React, { memo, useCallback } from 'react';
import { useChatDomain } from '@/lib/hooks/domain/useChatDomain';
import { Slider } from '@/components/ui/slider';

export const TemperatureSlider = memo(function TemperatureSlider() {
  const { state, actions } = useChatDomain();

  const handleTemperatureChange = useCallback((value: number[]) => {
    const newTemp = value[0];
    if (newTemp !== state.temperature) {
      actions.setTemperature(newTemp);
    }
  }, [state.temperature, actions]);

  return (
    <div className="p-4">
      <label className="block text-sm font-medium text-gray-200 mb-2">
        Temperature: {state.temperature}
      </label>
      <Slider
        defaultValue={[state.temperature]}
        min={0}
        max={1}
        step={0.1}
        onValueChange={handleTemperatureChange}
        className="w-full"
      />
    </div>
  );
}); 