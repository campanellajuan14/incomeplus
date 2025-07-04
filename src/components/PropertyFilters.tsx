import React from 'react';
import { X } from 'lucide-react';
import { PropertyFilters, defaultFilters } from '../types/filters';
import QuickFilters from './filters/QuickFilters';
import ActiveFilters from './filters/ActiveFilters';
import SortingControls from './filters/SortingControls';

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}

const PropertyFiltersComponent: React.FC<PropertyFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  // Count active filters (excluding city and default sorting)
  const getActiveFilterCount = () => {
    let count = 0;
    const filterKeys = Object.keys(filters) as (keyof PropertyFilters)[];
    
    filterKeys.forEach(key => {
      const value = filters[key];
      // Exclude default sorting values and city from active filter count
      if (key === 'sortBy' && value === 'cashFlow') return;
      if (key === 'sortOrder' && value === 'desc') return;
      if (key === 'city') return; // City is handled in SearchBar
      
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        count++;
      }
    });
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Header with active filters count and clear button */}
      {activeFilterCount > 0 && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetFilters}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="h-4 w-4 border border-gray-300 border-dashed rounded-full p-0.5 hover:border-gray-500 flex items-center justify-center">
                  <X/>
                </div>
                <span>Clear all filters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="px-6 py-3 border-b border-gray-100 bg-blue-50/30">
          <ActiveFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      )}

      {/* Main filters content */}
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
      </div>
    </div>
  );
};

export default PropertyFiltersComponent;
