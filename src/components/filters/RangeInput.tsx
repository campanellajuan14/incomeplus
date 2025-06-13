
import React from 'react';

interface RangeInputProps {
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

const RangeInput: React.FC<RangeInputProps> = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Max"
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMinChange(value ? Number(value) : undefined);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMaxChange(value ? Number(value) : undefined);
  };

  return (
    <div className="flex space-x-2">
      <div className="flex-1">
        <input
          type="number"
          placeholder={minPlaceholder}
          value={minValue || ''}
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
          value={maxValue || ''}
          onChange={handleMaxChange}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default RangeInput;
