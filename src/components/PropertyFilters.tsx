import React from 'react';
import { Search, Filter, Settings2, X } from 'lucide-react';
import { PropertyFilters, defaultFilters } from '../types/filters';
import QuickFilters from './filters/QuickFilters';
import AdvancedFilters from './filters/AdvancedFilters';
import ActiveFilters from './filters/ActiveFilters';
import SortingControls from './filters/SortingControls';

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onSearch: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const PropertyFiltersComponent: React.FC<PropertyFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isExpanded,
  onToggleExpanded
}) => {
  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    const filterKeys = Object.keys(filters) as (keyof PropertyFilters)[];
    
    filterKeys.forEach(key => {
      const value = filters[key];
      // Exclude default sorting values from active filter count
      if (key === 'sortBy' && value === 'cashFlow') return;
      if (key === 'sortOrder' && value === 'desc') return;
      
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        count++;
      }
    });
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">Property Filters</h3>
            </div>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="h-4 w-4 border border-gray-300 border-dashed rounded-full p-0.5 hover:border-gray-500 flex items-center justify-center">
                  <X/>
                </div>
                <span>Clear all filters</span>
              </button>
            )}
            <button
              onClick={onToggleExpanded}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <span className="text-sm font-medium">
                {isExpanded ? 'Show Less' : 'Advanced Filters'}
              </span>
              <Settings2 className={`h-4 w-4 transition-colors ${isExpanded ? 'fill-primary-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="px-6 py-3 border-b border-gray-100 bg-blue-50/30">
          <ActiveFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      )}

      <div className="p-6">
        <QuickFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
        />

        <div className="mt-6">
          <SortingControls
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={onSearch}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg flex items-center space-x-2 font-medium transition-all shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
          >
            <Search className="h-4 w-4" />
            <span>Search Properties</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/30">
          <div className="p-6">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFiltersComponent;
