
import { useState, useMemo } from 'react';
import { PropertyFilters, defaultFilters } from '../types/filters';
import { calculatePropertyMetrics, MortgageParams } from '../utils/mortgageCalculations';

export const usePropertySearch = (properties: any[]) => {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const filteredProperties = useMemo(() => {
    if (!properties.length) return [];

    return properties.filter(property => {
      // Convert filters to mortgage params for calculations
      const mortgageParams: MortgageParams = {
        mortgageRate: filters.mortgageRate || 5.5,
        amortizationPeriod: filters.amortizationPeriod || 25,
        downPaymentType: filters.downPaymentType === 'All' ? 'Percent' : (filters.downPaymentType || 'Percent'),
        downPaymentValue: filters.downPaymentValue || 20,
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
        const hasMatchingUnit = property.units?.some((unit: any) => unit.rentCategory === filters.rentCategory);
        if (!hasMatchingUnit) return false;
      }

      if (filters.vacancyStatus && filters.vacancyStatus !== 'All') {
        const hasMatchingUnit = property.units?.some((unit: any) => unit.vacancyStatus === filters.vacancyStatus);
        if (!hasMatchingUnit) return false;
      }

      return true;
    });
  }, [properties, filters]);

  const propertiesWithMetrics = useMemo(() => {
    return filteredProperties.map(property => {
      const mortgageParams: MortgageParams = {
        mortgageRate: filters.mortgageRate || 5.5,
        amortizationPeriod: filters.amortizationPeriod || 25,
        downPaymentType: filters.downPaymentType === 'All' ? 'Percent' : (filters.downPaymentType || 'Percent'),
        downPaymentValue: filters.downPaymentValue || 20,
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
