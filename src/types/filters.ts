
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

  // Income Filters
  incomeType?: 'Actual' | 'Estimated' | 'Mixed' | 'All';
  tenancyType?: 'On Leases' | 'Month to Month' | 'Mixed' | 'All';
  rentCategory?: 'Market Value' | 'Under Market Value' | 'All';
  vacancyStatus?: 'Occupied' | 'Vacant' | 'All';
}

export const defaultFilters: PropertyFilters = {
  mortgageRate: 5.5,
  amortizationPeriod: 25,
  downPaymentType: 'Percent',
  downPaymentValue: 20,
  incomeType: 'All',
  tenancyType: 'All',
  rentCategory: 'All',
  vacancyStatus: 'All'
};
