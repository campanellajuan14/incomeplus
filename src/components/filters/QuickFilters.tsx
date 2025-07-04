import React from 'react';
import { DollarSign, Users } from 'lucide-react';
import { PropertyFilters } from '../../types/filters';
import RangeInput from './RangeInput';

interface QuickFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Financial Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            Price Range
          </label>
          <RangeInput
            minValue={filters.priceMin}
            maxValue={filters.priceMax}
            onMinChange={(value) => updateFilter('priceMin', value)}
            onMaxChange={(value) => updateFilter('priceMax', value)}
            minPlaceholder="Min price"
            maxPlaceholder="Max price"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide flex items-center">
            <Users className="h-3 w-3 mr-1" />
            Units
          </label>
          <RangeInput
            minValue={filters.unitsMin}
            maxValue={filters.unitsMax}
            onMinChange={(value) => updateFilter('unitsMin', value)}
            onMaxChange={(value) => updateFilter('unitsMax', value)}
            minPlaceholder="Min units"
            maxPlaceholder="Max units"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            Cash Flow Range
          </label>
          <RangeInput
            minValue={filters.cashFlowMin}
            maxValue={filters.cashFlowMax}
            onMinChange={(value) => updateFilter('cashFlowMin', value)}
            onMaxChange={(value) => updateFilter('cashFlowMax', value)}
            minPlaceholder="Min cash flow"
            maxPlaceholder="Max cash flow"
          />
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;
