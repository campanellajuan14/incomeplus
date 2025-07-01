import { useState, useMemo } from 'react';
import { PropertyFilters, defaultFilters } from '../types/filters';
import { calculatePropertyMetrics, MortgageParams } from '../utils/mortgageCalculations';

type Unit = {
  id: string;
  unitType: 'Bachelor' | '1 Bedroom' | '2 Bedroom' | '3 Bedroom+' | 'Other';
  rentAmount: number;
  rentCategory: 'Market Value' | 'Under Market Value';
  vacancyStatus: 'Occupied' | 'Vacant';
  projectedRent?: number;
};

type Property = {
  id: string;
  property_title: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  purchase_price: number;
  number_of_units: number;
  property_description: string;
  income_type: 'Estimated' | 'Actual' | 'Mixed';
  tenancy_type: 'On Leases' | 'Month to Month' | 'Mixed';
  units: Unit[];
  property_taxes: number;
  insurance: number;
  hydro: number;
  gas: number;
  water: number;
  waste_management: number;
  maintenance: number;
  management_fees: number;
  miscellaneous: number;
  down_payment_type: 'Percent' | 'Fixed';
  down_payment_amount: number;
  amortization_period: number;
  mortgage_rate: number;
  images: string[];
  agent_name: string;
  agent_email: string;
  agent_phone: string;
  created_at: string;
};

export const usePropertySearch = (properties: Property[], initialFilters?: PropertyFilters) => {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters || defaultFilters);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const filteredProperties = useMemo(() => {
    if (!properties.length) return [];

    let filtered = properties.filter(property => {
      // Check if mortgage filters are applied
      const hasMortgageFilters = filters.mortgageRate !== undefined || 
                                filters.amortizationPeriod !== undefined || 
                                (filters.downPaymentType !== 'All' && filters.downPaymentType !== undefined) ||
                                filters.downPaymentValue !== undefined;

      // Use property-specific parameters if no mortgage filters are applied, otherwise use filter values
      const mortgageParams: MortgageParams = hasMortgageFilters ? {
        mortgageRate: filters.mortgageRate || 5.5,
        amortizationPeriod: filters.amortizationPeriod || 25,
        downPaymentType: filters.downPaymentType === 'All' ? 'Percent' : (filters.downPaymentType || 'Percent'),
        downPaymentValue: filters.downPaymentValue || 20,
        purchasePrice: property.purchase_price
      } : {
        mortgageRate: property.mortgage_rate || 4.0,
        amortizationPeriod: property.amortization_period || 25,
        downPaymentType: property.down_payment_type || 'Percent',
        downPaymentValue: property.down_payment_amount || 20,
        purchasePrice: property.purchase_price
      };

      // Calculate metrics for this property
      const metrics = calculatePropertyMetrics(property, mortgageParams);

      // Apply filters
      // Price range
      if (filters.priceMin && property.purchase_price < filters.priceMin) return false;
      if (filters.priceMax && property.purchase_price > filters.priceMax) return false;

      // Units range
      if (filters.unitsMin && property.number_of_units < filters.unitsMin) return false;
      if (filters.unitsMax && property.number_of_units > filters.unitsMax) return false;

      // Location filters
      if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.province && !property.province.toLowerCase().includes(filters.province.toLowerCase())) return false;

      // City radius search (enhanced location filtering)
      // Note: This is a simplified implementation. For production, you'd want to use proper geocoding and distance calculations
      if (filters.city && filters.cityRadius && filters.cityRadius !== 25) {
        // For now, we'll just use the basic city matching
        // In a full implementation, you'd calculate distance using lat/lng coordinates
        if (!property.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      }

      // Financial filters
      if (filters.cashFlowMin && metrics.monthlyCashFlow < filters.cashFlowMin) return false;
      if (filters.cashFlowMax && metrics.monthlyCashFlow > filters.cashFlowMax) return false;
      if (filters.roiMin && metrics.roi < filters.roiMin) return false;
      if (filters.roiMax && metrics.roi > filters.roiMax) return false;
      if (filters.capRateMin && metrics.capRate < filters.capRateMin) return false;
      if (filters.capRateMax && metrics.capRate > filters.capRateMax) return false;
      if (filters.debtServiceRatioMax && metrics.debtServiceRatio > filters.debtServiceRatioMax) return false;

      // Property characteristics filters
      if (filters.incomeType && filters.incomeType !== 'All' && property.income_type !== filters.incomeType) return false;
      if (filters.tenancyType && filters.tenancyType !== 'All' && property.tenancy_type !== filters.tenancyType) return false;

      // Unit-level filters (check if any unit matches the criteria)
      if (filters.rentCategory && filters.rentCategory !== 'All') {
        const hasMatchingUnit = property.units?.some((unit: Unit) => unit.rentCategory === filters.rentCategory);
        if (!hasMatchingUnit) return false;
      }

      if (filters.vacancyStatus && filters.vacancyStatus !== 'All') {
        const hasMatchingUnit = property.units?.some((unit: Unit) => unit.vacancyStatus === filters.vacancyStatus);
        if (!hasMatchingUnit) return false;
      }

      return true;
    });

    // Apply sorting
    if (filters.sortBy && filtered.length > 0) {
      filtered = filtered.sort((a, b) => {
        // Calculate metrics for both properties for sorting
        const getMetrics = (prop: typeof a) => {
          const hasMortgageFilters = filters.mortgageRate !== undefined || 
                                    filters.amortizationPeriod !== undefined || 
                                    (filters.downPaymentType !== 'All' && filters.downPaymentType !== undefined) ||
                                    filters.downPaymentValue !== undefined;

          const mortgageParams: MortgageParams = hasMortgageFilters ? {
            mortgageRate: filters.mortgageRate || 5.5,
            amortizationPeriod: filters.amortizationPeriod || 25,
            downPaymentType: filters.downPaymentType === 'All' ? 'Percent' : (filters.downPaymentType || 'Percent'),
            downPaymentValue: filters.downPaymentValue || 20,
            purchasePrice: prop.purchase_price
          } : {
            mortgageRate: prop.mortgage_rate || 4.0,
            amortizationPeriod: prop.amortization_period || 25,
            downPaymentType: prop.down_payment_type || 'Percent',
            downPaymentValue: prop.down_payment_amount || 20,
            purchasePrice: prop.purchase_price
          };

          return calculatePropertyMetrics(prop, mortgageParams);
        };

        const metricsA = getMetrics(a);
        const metricsB = getMetrics(b);

        let compareValue = 0;

        switch (filters.sortBy) {
          case 'cashFlow':
            compareValue = metricsA.monthlyCashFlow - metricsB.monthlyCashFlow;
            break;
          case 'capRate':
            compareValue = metricsA.capRate - metricsB.capRate;
            break;
          case 'roi':
            compareValue = metricsA.roi - metricsB.roi;
            break;
          case 'yearlyRoi':
            compareValue = metricsA.fullYearlyROI - metricsB.fullYearlyROI;
            break;
          case 'price':
            compareValue = a.purchase_price - b.purchase_price;
            break;
          default:
            return 0;
        }

        return filters.sortOrder === 'desc' ? -compareValue : compareValue;
      });
    }

    return filtered;
  }, [properties, filters]);

  const propertiesWithMetrics = useMemo(() => {
    return filteredProperties.map(property => {
      // Check if mortgage filters are applied
      const hasMortgageFilters = filters.mortgageRate !== undefined || 
                                filters.amortizationPeriod !== undefined || 
                                (filters.downPaymentType !== 'All' && filters.downPaymentType !== undefined) ||
                                filters.downPaymentValue !== undefined;

      // Use property-specific parameters if no mortgage filters are applied, otherwise use filter values
      const mortgageParams: MortgageParams = hasMortgageFilters ? {
        mortgageRate: filters.mortgageRate || 5.5,
        amortizationPeriod: filters.amortizationPeriod || 25,
        downPaymentType: filters.downPaymentType === 'All' ? 'Percent' : (filters.downPaymentType || 'Percent'),
        downPaymentValue: filters.downPaymentValue || 20,
        purchasePrice: property.purchase_price
      } : {
        mortgageRate: property.mortgage_rate || 4.0,
        amortizationPeriod: property.amortization_period || 25,
        downPaymentType: property.down_payment_type || 'Percent',
        downPaymentValue: property.down_payment_amount || 20,
        purchasePrice: property.purchase_price
      };

      const metrics = calculatePropertyMetrics(property, mortgageParams);
      return { ...property, calculatedMetrics: metrics };
    });
  }, [filteredProperties, filters]);

  const handleSearch = () => {
    // Search is automatically handled by the useMemo above
    // This function can be used for additional search actions like analytics tracking
    console.log('Search performed with filters:', filters);
  };

  return {
    filters,
    setFilters,
    filteredProperties: propertiesWithMetrics,
    handleSearch,
    isFiltersExpanded,
    setIsFiltersExpanded
  };
};
