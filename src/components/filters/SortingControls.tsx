import React from 'react';
import { ListFilter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PropertyFilters } from '../../types/filters';

interface SortingControlsProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}

const SortingControls: React.FC<SortingControlsProps> = ({
  filters,
  onFiltersChange
}) => {
  const getDefaultSortOrder = (sortBy: PropertyFilters['sortBy']): 'asc' | 'desc' => {
    // For financial metrics, higher is generally better (desc)
    // For price, lower might be preferred (asc)
    switch (sortBy) {
      case 'price':
        return 'asc'; // Low → High (cheaper first)
      case 'cashFlow':
      case 'capRate':
      case 'roi':
      case 'yearlyRoi':
      default:
        return 'desc'; // High → Low (better performance first)
    }
  };

  const updateSort = (sortBy: PropertyFilters['sortBy']) => {
    let newSortOrder: 'asc' | 'desc';
    
    // If clicking the same sort field, toggle the order
    if (filters.sortBy === sortBy) {
      newSortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
    } else {
      // Use logical default for the new sort field
      newSortOrder = getDefaultSortOrder(sortBy);
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
    
    const isDesc = filters.sortOrder === 'desc';
    
    switch (sortBy) {
      case 'price':
        return isDesc ? 'High → Low' : 'Low → High';
      case 'cashFlow':
        return isDesc ? 'Best → Worst' : 'Worst → Best';
      case 'capRate':
      case 'roi':
      case 'yearlyRoi':
        return isDesc ? 'High → Low' : 'Low → High';
      default:
        return isDesc ? 'High → Low' : 'Low → High';
    }
  };

  const sortOptions = [
    { key: 'cashFlow' as const, label: 'Cash Flow' },
    { key: 'capRate' as const, label: 'Cap Rate' },
    { key: 'roi' as const, label: 'ROI' },
    { key: 'yearlyRoi' as const, label: 'Yearly ROI' },
    { key: 'price' as const, label: 'Price' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center">
          <ListFilter className="h-3 w-3 mr-1" />
          Sort By
        </label>
        {filters.sortBy && (
          <span className="text-xs text-gray-500">
            {getSortLabel(filters.sortBy)}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {sortOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => updateSort(key)}
            className={`flex items-center justify-between px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
              filters.sortBy === key
                ? 'bg-primary-50 text-primary-700 border-primary-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <span className="font-medium">{label}</span>
            {getSortIcon(key)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortingControls; 