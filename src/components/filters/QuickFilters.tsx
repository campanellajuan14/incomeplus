import React from 'react';
import { Search, DollarSign, Users, MapPin } from 'lucide-react';
import { PropertyFilters } from '../../types/filters';
import SearchInput from './SearchInput';
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
      {/* First row - Location Search */}
      <div className="grid grid-cols-1">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            City & Radius Search
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <SearchInput
                value={filters.city || ''}
                onChange={(value) => updateFilter('city', value || undefined)}
                placeholder="City or location..."
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                value={filters.cityRadius || ''}
                onChange={(e) => updateFilter('cityRadius', Number(e.target.value) || undefined)}
                placeholder="25"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center text-xs text-gray-500 px-2">
              km
            </div>
          </div>
        </div>
      </div>

      {/* Second row - Financial Filters */}
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
