export interface PropertyFilters {
  // Mortgage Parameters
  mortgageRate?: number;
  amortizationPeriod?: number;
  downPaymentType?: 'Percent' | 'Fixed' | 'All';
  downPaymentValue?: number;

  // Financial Filters
  cashFlowMin?: number;
  cashFlowMax?: number;
  roiMin?: number;
  roiMax?: number;
  capRateMin?: number;
  capRateMax?: number;
  debtServiceRatioMax?: number;

  // Property Characteristics
  priceMin?: number;
  priceMax?: number;
  unitsMin?: number;
  unitsMax?: number;
  city?: string;
  province?: string;
  
  // Sorting options
  sortBy?: 'cashFlow' | 'capRate' | 'price' | 'roi' | 'yearlyRoi';
  sortOrder?: 'asc' | 'desc';

  // Income Filters
  incomeType?: 'Actual' | 'Estimated' | 'Mixed' | 'All';
  tenancyType?: 'On Leases' | 'Month to Month' | 'Mixed' | 'All';
  rentCategory?: 'Market Value' | 'Under Market Value' | 'All';
  vacancyStatus?: 'Occupied' | 'Vacant' | 'All';
}

export const defaultFilters: PropertyFilters = {
  // Remove default mortgage parameters to show property-specific values initially
  incomeType: 'All',
  tenancyType: 'All',
  rentCategory: 'All',
  vacancyStatus: 'All',
  sortBy: 'cashFlow',
  sortOrder: 'desc'
};
