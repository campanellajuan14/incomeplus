import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import SearchBar from '../components/SearchBar';
import PropertyFilters from '../components/PropertyFilters';
import EnhancedPropertyCard from '../components/EnhancedPropertyCard';
import PropertyMap from '../components/PropertyMap';
import LoadingSpinner from '../components/LoadingSpinner';
import InfiniteLoadingSpinner from '../components/InfiniteLoadingSpinner';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useSavedProperties } from '../hooks/useSavedProperties';
import { PropertyFilters as PropertyFiltersType } from '../types/filters';
import { Property } from '../types/property';
import { geocodePropertiesInBackground } from '../utils/geocodingUtils';

const PROPERTIES_PER_PAGE = 12;

const Properties: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
  const hasFetchedRef = useRef(false);

  const parseUrlFilters = (): PropertyFiltersType => {
    const searchParams = new URLSearchParams(location.search);
    const filters: PropertyFiltersType = {
      incomeType: 'All',
      tenancyType: 'All',
      rentCategory: 'All',
      vacancyStatus: 'All'
    };

    // Parse all filter parameters
    const mortgageRate = searchParams.get('mortgageRate');
    if (mortgageRate) filters.mortgageRate = parseFloat(mortgageRate);

    const amortizationPeriod = searchParams.get('amortizationPeriod');
    if (amortizationPeriod) filters.amortizationPeriod = parseInt(amortizationPeriod);

    const downPaymentType = searchParams.get('downPaymentType');
    if (downPaymentType && ['Percent', 'Fixed', 'All'].includes(downPaymentType)) {
      filters.downPaymentType = downPaymentType as 'Percent' | 'Fixed' | 'All';
    }

    const downPaymentValue = searchParams.get('downPaymentValue');
    if (downPaymentValue) filters.downPaymentValue = parseFloat(downPaymentValue);

    const priceMin = searchParams.get('priceMin');
    if (priceMin) filters.priceMin = parseFloat(priceMin);

    const priceMax = searchParams.get('priceMax');
    if (priceMax) filters.priceMax = parseFloat(priceMax);

    const cashFlowMin = searchParams.get('cashFlowMin');
    if (cashFlowMin) filters.cashFlowMin = parseFloat(cashFlowMin);

    const cashFlowMax = searchParams.get('cashFlowMax');
    if (cashFlowMax) filters.cashFlowMax = parseFloat(cashFlowMax);

    const roiMin = searchParams.get('roiMin');
    if (roiMin) filters.roiMin = parseFloat(roiMin);

    const roiMax = searchParams.get('roiMax');
    if (roiMax) filters.roiMax = parseFloat(roiMax);

    const capRateMin = searchParams.get('capRateMin');
    if (capRateMin) filters.capRateMin = parseFloat(capRateMin);

    const capRateMax = searchParams.get('capRateMax');
    if (capRateMax) filters.capRateMax = parseFloat(capRateMax);

    const debtServiceRatioMax = searchParams.get('debtServiceRatioMax');
    if (debtServiceRatioMax) filters.debtServiceRatioMax = parseFloat(debtServiceRatioMax);

    const unitsMin = searchParams.get('unitsMin');
    if (unitsMin) filters.unitsMin = parseInt(unitsMin);

    const unitsMax = searchParams.get('unitsMax');
    if (unitsMax) filters.unitsMax = parseInt(unitsMax);

    const city = searchParams.get('city');
    if (city) filters.city = city;

    const province = searchParams.get('province');
    if (province) filters.province = province;

    const incomeType = searchParams.get('incomeType');
    if (incomeType && ['Actual', 'Estimated', 'Mixed', 'All'].includes(incomeType)) {
      filters.incomeType = incomeType as 'Actual' | 'Estimated' | 'Mixed' | 'All';
    }

    const tenancyType = searchParams.get('tenancyType');
    if (tenancyType && ['On Leases', 'Month to Month', 'Mixed', 'All'].includes(tenancyType)) {
      filters.tenancyType = tenancyType as 'On Leases' | 'Month to Month' | 'Mixed' | 'All';
    }

    const rentCategory = searchParams.get('rentCategory');
    if (rentCategory && ['Market Value', 'Under Market Value', 'All'].includes(rentCategory)) {
      filters.rentCategory = rentCategory as 'Market Value' | 'Under Market Value' | 'All';
    }

    const vacancyStatus = searchParams.get('vacancyStatus');
    if (vacancyStatus && ['Occupied', 'Vacant', 'All'].includes(vacancyStatus)) {
      filters.vacancyStatus = vacancyStatus as 'Occupied' | 'Vacant' | 'All';
    }

    return filters;
  };

  const urlFilters = parseUrlFilters();

  const {
    filters,
    setFilters,
    filteredProperties,
    handleSearch
  } = usePropertySearch(allProperties, urlFilters);

  const {
    isSaved,
    toggleSaved
  } = useSavedProperties();

  const handleToggleSaved = async (propertyId: string) => {
    const wasSaved = isSaved(propertyId);
    const result = await toggleSaved(propertyId);
    
    if (result.success) {
      if (wasSaved) {
        console.log('Property removed from saved list', 'info');
      } else {
        console.log('Property saved successfully', 'success');
      }
    } else {
      console.log(result.error || 'Failed to update saved status', 'error');
    }
  };

  const loadMoreProperties = () => {
    if (!isLoadingMore && hasMore) {
      fetchProperties(false);
    }
  };

  // Intersection observer for infinite scroll
  const { targetRef } = useIntersectionObserver({
    onIntersect: loadMoreProperties,
    enabled: hasMore && !isLoadingMore && viewMode === 'grid',
    rootMargin: '200px'
  });

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProperties(true); // Reset to first page
    }
  }, [user]);

  // Reset pagination when filters change
  useEffect(() => {
    if (hasFetchedRef.current) {
      setCurrentPage(0);
      setHasMore(true);
      fetchProperties(true);
    }
  }, [filters]);

  const fetchProperties = async (resetPagination = false) => {
    try {
      if (resetPagination) {
        setIsLoading(true);
        setCurrentPage(0);
      } else {
        setIsLoadingMore(true);
      }

      const pageToFetch = resetPagination ? 0 : currentPage + 1;
      const from = pageToFetch * PROPERTIES_PER_PAGE;
      const to = from + PROPERTIES_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data && Array.isArray(data)) {
        const transformedProperties: Property[] = data.map(item => ({
          id: item.id,
          property_title: item.property_title,
          address: item.address,
          city: item.city,
          province: item.province,
          postal_code: item.postal_code || '',
          purchase_price: Number(item.purchase_price) || 0,
          number_of_units: Number(item.number_of_units) || 0,
          property_description: item.property_description || '',
          income_type: item.income_type as 'Estimated' | 'Actual' | 'Mixed' || 'Estimated',
          tenancy_type: item.tenancy_type as 'On Leases' | 'Month to Month' | 'Mixed' || 'On Leases',
          units: Array.isArray(item.units) ? item.units.map((unit: any) => ({
            id: unit.id || '',
            unitType: unit.unitType || 'Other',
            rentAmount: Number(unit.rentAmount) || 0,
            rentCategory: unit.rentCategory || 'Market Value',
            vacancyStatus: unit.vacancyStatus || 'Occupied',
            projectedRent: Number(unit.projectedRent) || undefined
          })) : [],
          property_taxes: Number(item.property_taxes) || 0,
          insurance: Number(item.insurance) || 0,
          hydro: Number(item.hydro) || 0,
          gas: Number(item.gas) || 0,
          water: Number(item.water) || 0,
          waste_management: Number(item.waste_management) || 0,
          maintenance: Number(item.maintenance) || 0,
          management_fees: Number(item.management_fees) || 0,
          miscellaneous: Number(item.miscellaneous) || 0,
          down_payment_type: item.down_payment_type as 'Percent' | 'Fixed' || 'Percent',
          down_payment_amount: Number(item.down_payment_amount) || 20,
          amortization_period: Number(item.amortization_period) || 25,
          mortgage_rate: Number(item.mortgage_rate) || 4.0,
          images: Array.isArray(item.images) ? item.images as string[] : [],
          agent_name: item.agent_name || '',
          agent_email: item.agent_email || '',
          agent_phone: item.agent_phone || '',
          created_at: item.created_at,
          latitude: item.latitude,
          longitude: item.longitude,
          status: item.status as 'active' | 'under_contract' | 'sold' || 'active',
          user_id: item.user_id
        }));

        if (resetPagination) {
          setAllProperties(transformedProperties);
        } else {
          setAllProperties(prev => [...prev, ...transformedProperties]);
        }

        // Update pagination state
        setCurrentPage(pageToFetch);
        const totalFetched = resetPagination ? transformedProperties.length : allProperties.length + transformedProperties.length;
        setHasMore(count ? totalFetched < count : transformedProperties.length === PROPERTIES_PER_PAGE);
        
        // Geocode properties in background if they're missing coordinates
        geocodePropertiesInBackground(transformedProperties).catch(err => {
          console.error('Background geocoding failed:', err);
        });
      } else {
        if (resetPagination) {
          setAllProperties([]);
        }
        setHasMore(false);
      }
    } catch (err: unknown) {
      console.error('Error fetching properties:', err);
      if (resetPagination) {
        setAllProperties([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const hasFilters = filters.mortgageRate !== undefined || 
                     filters.amortizationPeriod !== undefined || 
                     filters.downPaymentType !== 'All' && filters.downPaymentType !== undefined ||
                     filters.downPaymentValue !== undefined;

  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyId(property.id);
  };

  if (isLoading) {
    return (
      <LoadingSpinner 
        isVisible={true}
        message="Loading properties..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <PropertyFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {filteredProperties.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-12 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">
                {hasFilters 
                  ? "Try adjusting your filters to see more results."
                  : "No properties available at the moment."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            {viewMode === 'grid' ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => {
                    // Construct proper mortgage parameters for each property
                    const mortgageParams = {
                      mortgageRate: filters.mortgageRate || property.mortgage_rate || 4.0,
                      amortizationPeriod: filters.amortizationPeriod || property.amortization_period || 25,
                      downPaymentType: (filters.downPaymentType && filters.downPaymentType !== 'All' ? filters.downPaymentType : property.down_payment_type) as 'Percent' | 'Fixed',
                      downPaymentValue: filters.downPaymentValue || property.down_payment_amount || 20,
                      purchasePrice: property.purchase_price
                    };

                    return (
                      <EnhancedPropertyCard
                        key={property.id}
                        property={property}
                        dynamicMortgageParams={mortgageParams}
                        currentFilters={filters}
                        isSaved={isSaved(property.id)}
                        onToggleSaved={handleToggleSaved}
                      />
                    );
                  })}
                </div>
                
                {/* Infinite loading trigger and spinner */}
                {hasMore && (
                  <div ref={targetRef} className="mt-8">
                    <InfiniteLoadingSpinner 
                      isVisible={isLoadingMore}
                      message="Loading more properties..."
                    />
                  </div>
                )}
              </div>
            ) : (
              <PropertyMap
                properties={filteredProperties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertySelect}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
