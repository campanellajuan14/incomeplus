
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import PropertyFilters from '../components/PropertyFilters';
import EnhancedPropertyCard from '../components/EnhancedPropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import InfiniteLoadingSpinner from '../components/InfiniteLoadingSpinner';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { MortgageParams } from '../utils/mortgageCalculations';
import { PropertyFilters as PropertyFiltersType } from '../types/filters';
import { useInfiniteProperties } from '../hooks/useInfiniteProperties';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

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

const NewPropertyCard = () => {
  return (
    <Link 
      to="/properties/upload"
      className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-full min-h-[250px] text-center hover:bg-gray-100 transition-colors cursor-pointer touch-target"
    >
      <div className="bg-gray-200 rounded-full p-4 mb-4">
        <PlusCircle className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="font-medium text-lg text-gray-700">Add a New Rental Property</h3>
      <p className="text-gray-500 text-sm mt-2 max-w-xs">
        Click here to analyze a new rental property with comprehensive details.
      </p>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  // Parse URL search parameters into filters
  const parseUrlFilters = (): PropertyFiltersType => {
    const searchParams = new URLSearchParams(location.search);
    const filters: PropertyFiltersType = {
      // Set default values for dropdown fields
      incomeType: 'All',
      tenancyType: 'All',
      rentCategory: 'All',
      vacancyStatus: 'All'
    };

    // Parse mortgage parameters
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

    // Parse financial filters
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

    // Parse units range
    const unitsMin = searchParams.get('unitsMin');
    if (unitsMin) filters.unitsMin = parseInt(unitsMin);

    const unitsMax = searchParams.get('unitsMax');
    if (unitsMax) filters.unitsMax = parseInt(unitsMax);

    // Parse location filters
    const city = searchParams.get('city');
    if (city) filters.city = city;

    const province = searchParams.get('province');
    if (province) filters.province = province;

    // Parse property characteristics (override defaults if present in URL)
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

  // Check if URL has advanced filter parameters to auto-expand filters
  const hasAdvancedUrlFilters = Object.entries(urlFilters).some(([key, value]) => {
    // Skip basic filters
    if (['priceMin', 'priceMax', 'cashFlowMin', 'cashFlowMax', 'city', 'unitsMin', 'unitsMax'].includes(key)) {
      return false;
    }
    // Only consider it an advanced filter if it has a meaningful value (not undefined, null, empty string, or 'All')
    return value !== undefined && value !== null && value !== '' && value !== 'All';
  });

  const {
    filters,
    setFilters,
    filteredProperties,
    handleSearch,
    isFiltersExpanded,
    setIsFiltersExpanded
  } = usePropertySearch(allProperties, urlFilters);

  // Infinite loading hook
  const {
    displayedProperties,
    hasMore,
    isLoadingMore,
    loadMore
  } = useInfiniteProperties({
    filteredProperties,
    itemsPerPage: 5
  });

  // Intersection observer for infinite loading
  const { targetRef } = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: hasMore && !isLoadingMore && !isLoading
  });

  // Auto-expand filters if advanced filters are present in URL
  useEffect(() => {
    if (hasAdvancedUrlFilters) {
      setIsFiltersExpanded(true);
    }
  }, [hasAdvancedUrlFilters, setIsFiltersExpanded]);

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

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
          purchase_price: item.purchase_price,
          number_of_units: item.number_of_units,
          property_description: item.property_description || '',
          income_type: item.income_type as 'Estimated' | 'Actual' | 'Mixed' || 'Estimated',
          tenancy_type: item.tenancy_type as 'On Leases' | 'Month to Month' | 'Mixed' || 'On Leases',
          units: Array.isArray(item.units) ? item.units as Unit[] : [],
          property_taxes: item.property_taxes || 0,
          insurance: item.insurance || 0,
          hydro: item.hydro || 0,
          gas: item.gas || 0,
          water: item.water || 0,
          waste_management: item.waste_management || 0,
          maintenance: item.maintenance || 0,
          management_fees: item.management_fees || 0,
          miscellaneous: item.miscellaneous || 0,
          down_payment_type: item.down_payment_type as 'Percent' | 'Fixed' || 'Percent',
          down_payment_amount: item.down_payment_amount || 20,
          amortization_period: item.amortization_period || 25,
          mortgage_rate: item.mortgage_rate || 4.0,
          images: Array.isArray(item.images) ? item.images as string[] : [],
          agent_name: item.agent_name || '',
          agent_email: item.agent_email || '',
          agent_phone: item.agent_phone || '',
          created_at: item.created_at
        }));

        setAllProperties(transformedProperties);
      } else {
        setAllProperties([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching properties:', err);
      setAllProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create dynamic mortgage parameters from current filters
  // If no filters are applied, use null to let individual properties use their own parameters
  const hasFilters = filters.mortgageRate !== undefined || 
                     filters.amortizationPeriod !== undefined || 
                     filters.downPaymentType !== 'All' && filters.downPaymentType !== undefined ||
                     filters.downPaymentValue !== undefined;

  const dynamicMortgageParams: MortgageParams | null = hasFilters ? {
    mortgageRate: filters.mortgageRate || 5.5,
    amortizationPeriod: filters.amortizationPeriod || 25,
    downPaymentType: filters.downPaymentType === 'All' ? 'Percent' : (filters.downPaymentType || 'Percent'),
    downPaymentValue: filters.downPaymentValue || 20,
    purchasePrice: 0 // This will be set per property
  } : null;

  return (
    <div className="pt-16 md:pt-20 pb-16">
      {/* Loading Spinner Overlay */}
      <LoadingSpinner 
        isVisible={isLoading}
        message="Loading your properties..."
        variant="overlay"
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary-700 mb-2">Rental Properties</h1>
            <p className="text-gray-600">
              Properties you plan to buy and hold for long-term cash flow, including short-term rentals.
            </p>
          </div>
          <div className="flex mt-4 md:mt-0 w-full md:w-auto">
            <Link
              to="/properties"
              className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-50 touch-target w-1/2 md:w-auto text-center"
            >
              <span>View All</span>
            </Link>
            <Link
              to="/properties/upload"
              className="bg-primary-500 text-white px-3 py-2 rounded hover:bg-primary-600 flex items-center justify-center touch-target w-1/2 md:w-auto"
            >
              <PlusCircle className="h-4 w-4 mr-1 md:mr-2" />
              <span>Add Property</span>
            </Link>
          </div>
        </div>

        {/* Search and Filter Component */}
        {!isLoading && (
          <PropertyFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            isExpanded={isFiltersExpanded}
            onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
          />
        )}

        {/* Results Summary */}
        {!isLoading && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Showing {displayedProperties.length} of {filteredProperties.length} properties
              {filteredProperties.length !== allProperties.length && ` (${allProperties.length} total)`}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {!isLoading && (
            <>
              <NewPropertyCard />
              {displayedProperties.map(property => (
                <EnhancedPropertyCard 
                  key={property.id} 
                  property={property} 
                  dynamicMortgageParams={dynamicMortgageParams ? {
                    ...dynamicMortgageParams,
                    purchasePrice: property.purchase_price
                  } : undefined}
                  currentFilters={filters}
                />
              ))}
            </>
          )}
        </div>

        {/* Infinite Loading Trigger */}
        {!isLoading && hasMore && (
          <div ref={targetRef} className="mt-8 flex justify-center">
            <div className="text-center">
              {isLoadingMore ? (
                <InfiniteLoadingSpinner 
                  isVisible={true}
                  message="Loading more properties..."
                />
              ) : (
                <button
                  onClick={loadMore}
                  className="bg-primary-500 text-white px-6 py-2 rounded hover:bg-primary-600 transition-colors"
                >
                  Load More Properties
                </button>
              )}
            </div>
          </div>
        )}

        {/* No more properties message */}
        {!isLoading && !hasMore && displayedProperties.length > 6 && (
          <div className="mt-8 text-center text-gray-500">
            You've reached the end of your properties
          </div>
        )}
     
        
      </div>
    </div>
  );
};

export default Dashboard;
