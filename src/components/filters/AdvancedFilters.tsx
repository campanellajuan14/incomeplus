import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Building } from 'lucide-react';
import { PropertyFilters } from '../../types/filters';
import FilterSection from './FilterSection';
import FilterDropdown from './FilterDropdown';
import RangeInput from './RangeInput';

interface AdvancedFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  useDebouncing?: boolean; // When false, inputs update immediately (for modal use)
}

interface DebouncedInputProps {
  type: 'text' | 'number';
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  step?: string;
  className?: string;
  debounceMs?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  step,
  className,
  debounceMs = 500
}) => {
  const [localValue, setLocalValue] = useState(value?.toString() || '');

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const processedValue = localValue ? (type === 'number' ? Number(localValue) : localValue) : undefined;
      if (processedValue !== value) {
        onChange(processedValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [localValue, onChange, debounceMs, value, type]);

  return (
    <input
      type={type}
      step={step}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
};

// Simple input component for modal use (no debouncing)
const SimpleInput: React.FC<DebouncedInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  step,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const processedValue = newValue ? (type === 'number' ? Number(newValue) : newValue) : undefined;
    onChange(processedValue);
  };

  return (
    <input
      type={type}
      step={step}
      value={value?.toString() || ''}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  useDebouncing = true
}) => {
  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Choose input component based on debouncing preference
  const InputComponent = useDebouncing ? DebouncedInput : SimpleInput;

  const mortgageOptions = [
    { value: 'All', label: 'All Payment Types' },
    { value: 'Percent', label: 'Percentage Down' },
    { value: 'Fixed', label: 'Fixed Amount Down' }
  ];

  const incomeTypeOptions = [
    { value: 'All', label: 'All Income Types' },
    { value: 'Actual', label: 'Actual Income' },
    { value: 'Estimated', label: 'Projected Income' },
    { value: 'Mixed', label: 'Mixed Income' }
  ];

  const tenancyOptions = [
    { value: 'All', label: 'All Tenancy Types' },
    { value: 'On Leases', label: 'On Leases' },
    { value: 'Month to Month', label: 'Month to Month' },
    { value: 'Mixed', label: 'Mixed Tenancy' }
  ];

  const vacancyOptions = [
    { value: 'All', label: 'All Properties' },
    { value: 'Occupied', label: 'Occupied Only' },
    { value: 'Vacant', label: 'Vacant Only' }
  ];

  return (
    <div className="space-y-8">
      <FilterSection title="Mortgage Parameters" icon={<DollarSign className="h-4 w-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mortgage Rate (%)</label>
            <InputComponent
              type="number"
              step="0.1"
              value={filters.mortgageRate}
              onChange={(value) => updateFilter('mortgageRate', value as number | undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="e.g. 5.5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amortization (Years)</label>
            <InputComponent
              type="number"
              value={filters.amortizationPeriod}
              onChange={(value) => updateFilter('amortizationPeriod', value as number | undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="e.g. 25"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Down Payment Type</label>
            <FilterDropdown
              options={mortgageOptions}
              value={filters.downPaymentType || 'All'}
              onChange={(value: string) => updateFilter('downPaymentType', value as 'Percent' | 'Fixed' | 'All')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Down Payment Value</label>
            <InputComponent
              type="number"
              value={filters.downPaymentValue}
              onChange={(value) => updateFilter('downPaymentValue', value as number | undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Amount or %"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Financial Metrics" icon={<TrendingUp className="h-4 w-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ROI Range (%)</label>
            <RangeInput
              minValue={filters.roiMin}
              maxValue={filters.roiMax}
              onMinChange={(value) => updateFilter('roiMin', value)}
              onMaxChange={(value) => updateFilter('roiMax', value)}
              minPlaceholder="Min ROI"
              maxPlaceholder="Max ROI"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cap Rate Range (%)</label>
            <RangeInput
              minValue={filters.capRateMin}
              maxValue={filters.capRateMax}
              onMinChange={(value) => updateFilter('capRateMin', value)}
              onMaxChange={(value) => updateFilter('capRateMax', value)}
              minPlaceholder="Min cap rate"
              maxPlaceholder="Max cap rate"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Debt Service Ratio (%)</label>
            <InputComponent
              type="number"
              value={filters.debtServiceRatioMax}
              onChange={(value) => updateFilter('debtServiceRatioMax', value as number | undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Max ratio"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Property Characteristics" icon={<Building className="h-4 w-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
            <InputComponent
              type="text"
              placeholder="Enter province"
              value={filters.province}
              onChange={(value) => updateFilter('province', value as string | undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Income Type</label>
            <FilterDropdown
              options={incomeTypeOptions}
              value={filters.incomeType || 'All'}
              onChange={(value: string) => updateFilter('incomeType', value as 'Actual' | 'Estimated' | 'Mixed' | 'All')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tenancy Type</label>
            <FilterDropdown
              options={tenancyOptions}
              value={filters.tenancyType || 'All'}
              onChange={(value: string) => updateFilter('tenancyType', value as 'On Leases' | 'Month to Month' | 'Mixed' | 'All')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vacancy Status</label>
            <FilterDropdown
              options={vacancyOptions}
              value={filters.vacancyStatus || 'All'}
              onChange={(value: string) => updateFilter('vacancyStatus', value as 'Occupied' | 'Vacant' | 'All')}
            />
          </div>
        </div>
      </FilterSection>
    </div>
  );
};

export default AdvancedFilters;
