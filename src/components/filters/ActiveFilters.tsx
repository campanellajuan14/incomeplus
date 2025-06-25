
import React from 'react';
import { X } from 'lucide-react';
import { PropertyFilters } from '../../types/filters';

interface ActiveFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const removeFilter = (key: keyof PropertyFilters) => {
    const newFilters = { ...filters };
    if (key === 'downPaymentType' || key === 'incomeType' || key === 'tenancyType' || key === 'rentCategory' || key === 'vacancyStatus') {
      newFilters[key] = 'All';
    } else if (key === 'sortBy') {
      newFilters[key] = 'cashFlow'; // Default sort
    } else if (key === 'sortOrder') {
      newFilters[key] = 'desc'; // Default order
    } else {
      delete newFilters[key];
    }
    onFiltersChange(newFilters);
  };

  const getFilterLabel = (key: keyof PropertyFilters, value: any): string => {
    switch (key) {
      case 'city':
        return `City: ${value}`;
      case 'province':
        return `Province: ${value}`;
      case 'priceMin':
        return `Min Price: $${value.toLocaleString()}`;
      case 'priceMax':
        return `Max Price: $${value.toLocaleString()}`;
      case 'unitsMin':
        return `Min Units: ${value}`;
      case 'unitsMax':
        return `Max Units: ${value}`;
      case 'cashFlowMin':
        return `Min Cash Flow: $${value.toLocaleString()}`;
      case 'cashFlowMax':
        return `Max Cash Flow: $${value.toLocaleString()}`;
      case 'roiMin':
        return `Min ROI: ${value}%`;
      case 'roiMax':
        return `Max ROI: ${value}%`;
      case 'capRateMin':
        return `Min Cap Rate: ${value}%`;
      case 'capRateMax':
        return `Max Cap Rate: ${value}%`;
      case 'mortgageRate':
        return `Mortgage Rate: ${value}%`;
      case 'amortizationPeriod':
        return `Amortization: ${value} years`;
      case 'downPaymentType':
        return `Payment Type: ${value}`;
      case 'downPaymentValue':
        return `Down Payment: ${value}`;
      case 'debtServiceRatioMax':
        return `Max Debt Ratio: ${value}%`;
      case 'incomeType':
        return `Income: ${value}`;
      case 'tenancyType':
        return `Tenancy: ${value}`;
      case 'rentCategory':
        return `Rent: ${value}`;
      case 'vacancyStatus':
        return `Vacancy: ${value}`;
      case 'yearBuiltMin':
        return `Min Year Built: ${value}`;
      case 'yearBuiltMax':
        return `Max Year Built: ${value}`;
      case 'cityRadius':
        return `Radius: ${value}km`;
      case 'sortBy':
        return `Sort by: ${value}`;
      case 'sortOrder':
        return `Order: ${value === 'asc' ? 'Low → High' : 'High → Low'}`;
      default:
        return `${key}: ${value}`;
    }
  };

  const activeFilters = Object.entries(filters).filter(([, value]) => {
    return value !== undefined && value !== null && value !== '' && value !== 'All';
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map(([key, value]) => (
        <div
          key={key}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
        >
          <span>{getFilterLabel(key as keyof PropertyFilters, value)}</span>
          <button
            onClick={() => removeFilter(key as keyof PropertyFilters)}
            className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ActiveFilters;
