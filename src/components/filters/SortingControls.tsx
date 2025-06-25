import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PropertyFilters } from '../../types/filters';

interface SortingControlsProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}

const SortingControls: React.FC<SortingControlsProps> = ({
  filters,
  onFiltersChange
}) => {
  const updateSort = (sortBy: PropertyFilters['sortBy']) => {
    let newSortOrder: 'asc' | 'desc' = 'desc';
    
    // If clicking the same sort field, toggle the order
    if (filters.sortBy === sortBy) {
      newSortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
    }
    
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: newSortOrder
    });
  };

  const getSortIcon = (sortBy: PropertyFilters['sortBy']) => {
    if (filters.sortBy !== sortBy) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    return filters.sortOrder === 'desc' 
      ? <ArrowDown className="h-4 w-4 text-primary-600" />
      : <ArrowUp className="h-4 w-4 text-primary-600" />;
  };

  const getSortLabel = (sortBy: PropertyFilters['sortBy']) => {
    if (filters.sortBy !== sortBy) return '';
    return filters.sortOrder === 'desc' ? 'High → Low' : 'Low → High';
  };

  const sortOptions = [
    { key: 'cashFlow' as const, label: 'Cash Flow' },
    { key: 'capRate' as const, label: 'Cap Rate' },
    { key: 'roi' as const, label: 'ROI' },
    { key: 'yearlyRoi' as const, label: 'Yearly ROI' },
    { key: 'price' as const, label: 'Price' },
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort Properties
        </h4>
        {filters.sortBy && (
          <span className="text-xs text-gray-500">
            {getSortLabel(filters.sortBy)}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {sortOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => updateSort(key)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filters.sortBy === key
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{label}</span>
            {getSortIcon(key)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortingControls; 