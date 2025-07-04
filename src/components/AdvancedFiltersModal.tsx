import React, { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { PropertyFilters, defaultFilters } from '../types/filters';
import AdvancedFilters from './filters/AdvancedFilters';

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onSearch: () => void;
}

const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onSearch
}) => {
  // Local state for the modal - changes are not applied until user clicks "Apply Filters"
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);

  // Update local filters when modal opens or external filters change
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const resetLocalFilters = () => {
    setLocalFilters(defaultFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onSearch();
    onClose();
  };

  const handleCancel = () => {
    // Reset local filters to the current applied filters
    setLocalFilters(filters);
    onClose();
  };

  // Count active filters in local state (excluding city since it's in the main search bar)
  const getActiveFilterCount = () => {
    let count = 0;
    const filterKeys = Object.keys(localFilters) as (keyof PropertyFilters)[];
    
    filterKeys.forEach(key => {
      const value = localFilters[key];
      // Exclude default sorting values and city from active filter count
      if (key === 'sortBy' && value === 'cashFlow') return;
      if (key === 'sortOrder' && value === 'desc') return;
      if (key === 'city') return; // City is handled in main search bar
      
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        count++;
      }
    });
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900">Advanced Filters</h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6">
              {/* Advanced Filters Only */}
              <AdvancedFilters
                filters={localFilters}
                onFiltersChange={setLocalFilters}
                useDebouncing={false}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={resetLocalFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFiltersModal; 