import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid3X3, Map } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import PropertyFilters from '../components/PropertyFilters';
import EnhancedPropertyCard from '../components/EnhancedPropertyCard';
import PropertyMap from '../components/PropertyMap';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { MortgageParams } from '../utils/mortgageCalculations';
import { PropertyFilters as PropertyFiltersType } from '../types/filters';
import { Property, Unit } from '../types/property';

const Properties: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

    // Parse all filter parameters (same logic as Dashboard)
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
    handleSearch,
    isFiltersExpanded,
    setIsFiltersExpanded
  } = usePropertySearch(allProperties, urlFilters);

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

  const hasFilters = filters.mortgageRate !== undefined || 
                     filters.amortizationPeriod !== undefined || 
                     filters.downPaymentType !== 'All' && filters.downPaymentType !== undefined ||
                     filters.downPaymentValue !== undefined;

  const dynamicMortgageParams: MortgageParams | null = hasFilters ? {
    mortgageRate: filters.mortgageRate || 5.5,
    amortizationPeriod: filters.amortizationPeriod || 25,
    downPaymentType: filters.downPaymentType === 'All' ? 'Percent' : (filters.downPaymentType || 'Percent'),
    downPaymentValue: filters.downPaymentValue || 20,
    purchasePrice: 0
  } : null;

  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyId(property.id);
    if (viewMode === 'map') {
      // Navigate to property detail with current filters
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'All') {
          searchParams.set(key, value.toString());
        }
      });
      
      const propertyUrl = searchParams.toString() 
        ? `/properties/${property.id}?${searchParams.toString()}`
        : `/properties/${property.id}`;
      navigate(propertyUrl);
    }
  };

  return (
    <div className="pt-16 md:pt-20 pb-16">
      <LoadingSpinner 
        isVisible={isLoading}
        message="Loading properties..."
        variant="overlay"
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary-700 mb-2">All Properties</h1>
            <p className="text-gray-600">
              Explore all rental properties with detailed analysis and map view.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-3 py-2 rounded border transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-500 text-white border-primary-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center px-3 py-2 rounded border transition-colors ${
                viewMode === 'map' 
                  ? 'bg-primary-500 text-white border-primary-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Map className="h-4 w-4 mr-1" />
              Map
            </button>
          </div>
        </div>

        {!isLoading && (
          <PropertyFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            isExpanded={isFiltersExpanded}
            onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
          />
        )}

        {!isLoading && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Showing {filteredProperties.length} of {allProperties.length} properties
            </div>
          </div>
        )}

        {viewMode === 'map' ? (
          <div className="space-y-6">
            <PropertyMap
              properties={filteredProperties}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={handlePropertySelect}
              height="600px"
            />
            {selectedPropertyId && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold mb-2">Selected Property</h3>
                {(() => {
                  const selectedProperty = filteredProperties.find(p => p.id === selectedPropertyId);
                  if (!selectedProperty) return null;
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EnhancedPropertyCard 
                        property={selectedProperty}
                        dynamicMortgageParams={dynamicMortgageParams ? {
                          ...dynamicMortgageParams,
                          purchasePrice: selectedProperty.purchase_price
                        } : undefined}
                        currentFilters={filters}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {!isLoading && filteredProperties.map(property => (
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
          </div>
        )}

        {!isLoading && filteredProperties.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No properties found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
