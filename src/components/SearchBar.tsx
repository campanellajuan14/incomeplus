import React, { useState } from 'react';
import { Search, Settings2, Grid3X3, Map } from 'lucide-react';
import { PropertyFilters } from '../types/filters';
import SearchInput from './filters/SearchInput';
import AdvancedFiltersModal from './AdvancedFiltersModal';

interface SearchBarProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onSearch: () => void;
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  viewMode,
  onViewModeChange
}) => {
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);

  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleAdvancedFiltersChange = (newFilters: PropertyFilters) => {
    onFiltersChange(newFilters);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mb-6">
        <div className="flex sm:flex-row gap-4 justify-between sm:items-center">
          <div className="flex gap-3">
            <div className="w-[300px]">
              <SearchInput
                value={filters.city || ''}
                onChange={(value) => updateFilter('city', value || undefined)}
                placeholder="Search by city..."
                icon={<Search className="h-4 w-4" />}
              />
            </div>

                          <button
                onClick={() => setIsAdvancedModalOpen(true)}
                className="flex items-center space-x-2 px-2 py-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors whitespace-nowrap"
              >
                <Settings2 className="h-4 w-4" />
                <span>Advanced Filters</span>
              </button>

          </div>
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        filters={filters}
        onFiltersChange={handleAdvancedFiltersChange}
        onSearch={onSearch}
      />
    </>
  );
};

export default SearchBar; 