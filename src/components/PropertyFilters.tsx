import React from 'react';
import { Search, Filter, DollarSign, Home, Users } from 'lucide-react';
import { PropertyFilters, defaultFilters } from '../types/filters';

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
  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Property Filters</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
            <button
              onClick={onToggleExpanded}
              className="text-primary-600 hover:text-primary-800"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) => updateFilter('priceMin', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) => updateFilter('priceMax', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Cash Flow
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.cashFlowMin || ''}
                onChange={(e) => updateFilter('cashFlowMin', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.cashFlowMax || ''}
                onChange={(e) => updateFilter('cashFlowMax', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="h-4 w-4 inline mr-1" />
              City
            </label>
            <input
              type="text"
              placeholder="Enter city"
              value={filters.city || ''}
              onChange={(e) => updateFilter('city', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Units
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.unitsMin || ''}
                onChange={(e) => updateFilter('unitsMin', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.unitsMax || ''}
                onChange={(e) => updateFilter('unitsMax', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={onSearch}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg flex items-center hover:bg-primary-600 transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Properties
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Advanced Filters</h4>
          
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Mortgage Parameters</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mortgage Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={filters.mortgageRate || ''}
                  onChange={(e) => updateFilter('mortgageRate', Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amortization (Years)</label>
                <input
                  type="number"
                  value={filters.amortizationPeriod || ''}
                  onChange={(e) => updateFilter('amortizationPeriod', Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Down Payment Type</label>
                <select
                  value={filters.downPaymentType || 'All'}
                  onChange={(e) => updateFilter('downPaymentType', e.target.value as 'Percent' | 'Fixed' | 'All')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="All">All</option>
                  <option value="Percent">Percent</option>
                  <option value="Fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Down Payment Value</label>
                <input
                  type="number"
                  value={filters.downPaymentValue || ''}
                  onChange={(e) => updateFilter('downPaymentValue', Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Financial Metrics</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ROI Range (%)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.roiMin || ''}
                    onChange={(e) => updateFilter('roiMin', Number(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.roiMax || ''}
                    onChange={(e) => updateFilter('roiMax', Number(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cap Rate Range (%)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.capRateMin || ''}
                    onChange={(e) => updateFilter('capRateMin', Number(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.capRateMax || ''}
                    onChange={(e) => updateFilter('capRateMax', Number(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Debt Service Ratio (%)</label>
                <input
                  type="number"
                  value={filters.debtServiceRatioMax || ''}
                  onChange={(e) => updateFilter('debtServiceRatioMax', Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Property & Income Characteristics</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Province</label>
                <input
                  type="text"
                  placeholder="Enter province"
                  value={filters.province || ''}
                  onChange={(e) => updateFilter('province', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Income Type</label>
                <select
                  value={filters.incomeType || 'All'}
                  onChange={(e) => updateFilter('incomeType', e.target.value as 'Actual' | 'Estimated' | 'Mixed' | 'All')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="All">All</option>
                  <option value="Actual">Actual</option>
                  <option value="Estimated">Estimated</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tenancy Type</label>
                <select
                  value={filters.tenancyType || 'All'}
                  onChange={(e) => updateFilter('tenancyType', e.target.value as 'On Leases' | 'Month to Month' | 'Mixed' | 'All')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="All">All</option>
                  <option value="On Leases">On Leases</option>
                  <option value="Month to Month">Month to Month</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Vacancy Status</label>
                <select
                  value={filters.vacancyStatus || 'All'}
                  onChange={(e) => updateFilter('vacancyStatus', e.target.value as 'Occupied' | 'Vacant' | 'All')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="All">All</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Vacant">Vacant</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFiltersComponent;
