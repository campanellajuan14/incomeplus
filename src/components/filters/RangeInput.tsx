import React, { useState, useEffect } from 'react';

interface RangeInputProps {
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  debounceMs?: number;
}

const RangeInput: React.FC<RangeInputProps> = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  debounceMs = 1000
}) => {
  const [localMinValue, setLocalMinValue] = useState(minValue?.toString() || '');
  const [localMaxValue, setLocalMaxValue] = useState(maxValue?.toString() || '');

  // Update local values when external values change
  useEffect(() => {
    setLocalMinValue(minValue?.toString() || '');
  }, [minValue]);

  useEffect(() => {
    setLocalMaxValue(maxValue?.toString() || '');
  }, [maxValue]);

  // Debounce min value changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const numValue = localMinValue ? Number(localMinValue) : undefined;
      if (numValue !== minValue) {
        onMinChange(numValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [localMinValue, onMinChange, debounceMs, minValue]);

  // Debounce max value changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const numValue = localMaxValue ? Number(localMaxValue) : undefined;
      if (numValue !== maxValue) {
        onMaxChange(numValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [localMaxValue, onMaxChange, debounceMs, maxValue]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMinValue(e.target.value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMaxValue(e.target.value);
  };

  return (
    <div className="flex space-x-2">
      <div className="flex-1">
        <input
          type="number"
          placeholder={minPlaceholder}
          value={localMinValue}
          onChange={handleMinChange}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400"
        />
      </div>
      <div className="flex items-center px-1">
        <span className="text-gray-400 text-sm">to</span>
      </div>
      <div className="flex-1">
        <input
          type="number"
          placeholder={maxPlaceholder}
          value={localMaxValue}
          onChange={handleMaxChange}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default RangeInput;
