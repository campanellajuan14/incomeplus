import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, TrendingUp, Home, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { calculatePropertyMetrics, MortgageParams } from '../utils/mortgageCalculations';
import PropertyMap from '../components/PropertyMap';

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

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (id && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProperty(id);
    } else if (!id) {
      setError('Property ID is required');
      setIsLoading(false);
    }
  }, [id, user, navigate]);

  const fetchProperty = async (propertyId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        const transformedProperty: Property = {
          id: data.id,
          property_title: data.property_title,
          address: data.address,
          city: data.city,
          province: data.province,
          postal_code: data.postal_code,
          purchase_price: data.purchase_price,
          number_of_units: data.number_of_units,
          property_description: data.property_description || '',
          income_type: data.income_type as 'Estimated' | 'Actual' | 'Mixed',
          tenancy_type: data.tenancy_type as 'On Leases' | 'Month to Month' | 'Mixed',
          units: Array.isArray(data.units) ? data.units as Unit[] : [],
          property_taxes: data.property_taxes || 0,
          insurance: data.insurance || 0,
          hydro: data.hydro || 0,
          gas: data.gas || 0,
          water: data.water || 0,
          waste_management: data.waste_management || 0,
          maintenance: data.maintenance || 0,
          management_fees: data.management_fees || 0,
          miscellaneous: data.miscellaneous || 0,
          down_payment_type: data.down_payment_type as 'Percent' | 'Fixed',
          down_payment_amount: data.down_payment_amount,
          amortization_period: data.amortization_period,
          mortgage_rate: data.mortgage_rate,
          images: Array.isArray(data.images) ? data.images as string[] : [],
          agent_name: data.agent_name,
          agent_email: data.agent_email,
          agent_phone: data.agent_phone,
          created_at: data.created_at
        };

        setProperty(transformedProperty);
      }
    } catch (err: unknown) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  // Preserve search parameters when navigating back
  const handleBackToDashboard = () => {
    const searchParams = new URLSearchParams(location.search);
    const dashboardUrl = searchParams.toString() 
      ? `/dashboard?${searchParams.toString()}` 
      : '/dashboard';
    navigate(dashboardUrl);
  };

  if (isLoading) {
    return (
      <div className="pt-16 md:pt-20 pb-16">
        <LoadingSpinner 
          isVisible={isLoading}
          message="Loading property details..."
          variant="overlay"
        />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="pt-16 md:pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-8 text-red-600">
            {error || 'Property not found'}
          </div>
          <div className="text-center">
            <button 
              onClick={handleBackToDashboard}
              className="text-primary-600 hover:text-primary-800 cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate financial metrics
  // Check for search parameters in URL
  const searchParams = new URLSearchParams(location.search);
  const urlMortgageRate = searchParams.get('mortgageRate');
  const urlAmortizationPeriod = searchParams.get('amortizationPeriod');
  const urlDownPaymentType = searchParams.get('downPaymentType');
  const urlDownPaymentValue = searchParams.get('downPaymentValue');

  // Use URL parameters if they exist, otherwise use property defaults
  const mortgageParams: MortgageParams = {
    mortgageRate: urlMortgageRate ? parseFloat(urlMortgageRate) : property.mortgage_rate,
    amortizationPeriod: urlAmortizationPeriod ? parseInt(urlAmortizationPeriod) : property.amortization_period,
    downPaymentType: (urlDownPaymentType as 'Percent' | 'Fixed') || property.down_payment_type,
    downPaymentValue: urlDownPaymentValue ? parseFloat(urlDownPaymentValue) : property.down_payment_amount,
    purchasePrice: property.purchase_price
  };

  const metrics = calculatePropertyMetrics(property, mortgageParams);

  return (
    <div className="pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Property Map Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                Property Location
              </h3>
              <PropertyMap
                properties={[property]}
                selectedPropertyId={property.id}
                height="400px"
                zoom={15}
                enableClustering={false}
                autoFit={false}
              />
            </div>

            {/* Existing image carousel section */}
            {property.images.length > 0 && (
              <div className="relative mb-6">
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <img
                    src={property.images[currentImageIndex]}
                    alt={`${property.property_title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded">
                        {currentImageIndex + 1} of {property.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {property.images.length > 1 && (
                  <div className="flex mt-4 space-x-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                          index === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.property_title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{property.address}, {property.city}, {property.province} {property.postal_code}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <Home className="h-6 w-6 mx-auto mb-1 text-primary-500" />
                  <div className="font-semibold">{property.number_of_units}</div>
                  <div className="text-sm text-gray-600">Units</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <Users className="h-6 w-6 mx-auto mb-1 text-green-500" />
                  <div className="font-semibold">{property.units.filter(u => u.vacancyStatus === 'Occupied').length}</div>
                  <div className="text-sm text-gray-600">Occupied</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <TrendingUp className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                  <div className="font-semibold">{property.income_type}</div>
                  <div className="text-sm text-gray-600">Income Type</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <Calendar className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                  <div className="font-semibold">{property.tenancy_type}</div>
                  <div className="text-sm text-gray-600">Tenancy</div>
                </div>
              </div>

              {property.property_description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700">{property.property_description}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-xl mb-4">Unit Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Unit Type</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Current Rent</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">Projected Rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.units.map((unit, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3">{unit.unitType}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            unit.vacancyStatus === 'Occupied' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {unit.vacancyStatus}
                          </span>
                        </td>
                        <td className="py-3 font-medium">${unit.rentAmount.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            unit.rentCategory === 'Market Value' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {unit.rentCategory}
                          </span>
                        </td>
                        <td className="py-3">
                          {unit.projectedRent ? `$${unit.projectedRent.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-xl">Purchase Details</h3>
                {(urlMortgageRate || urlAmortizationPeriod || urlDownPaymentType || urlDownPaymentValue) && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Using Search Criteria
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Price:</span>
                  <span className="font-semibold text-2xl text-primary-600">
                    ${property.purchase_price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-medium">
                    {mortgageParams.downPaymentType === 'Percent' 
                      ? `${mortgageParams.downPaymentValue}%` 
                      : `$${mortgageParams.downPaymentValue.toLocaleString()}`}
                    {urlDownPaymentType && (
                      <span className="text-blue-600 text-xs ml-1">(Search)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mortgage Rate:</span>
                  <span className="font-medium">
                    {mortgageParams.mortgageRate}%
                    {urlMortgageRate && (
                      <span className="text-blue-600 text-xs ml-1">(Search)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amortization:</span>
                  <span className="font-medium">
                    {mortgageParams.amortizationPeriod} years
                    {urlAmortizationPeriod && (
                      <span className="text-blue-600 text-xs ml-1">(Search)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-semibold text-xl mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-gray-700">Monthly Cash Flow</span>
                  <span className={`font-bold text-lg ${
                    metrics.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.round(metrics.monthlyCashFlow).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-700">Cash-on-Cash ROI</span>
                  <span className="font-bold text-lg text-blue-600">
                    {metrics.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-gray-700">Cap Rate</span>
                  <span className="font-bold text-lg text-purple-600">
                    {metrics.capRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <span className="text-gray-700">Debt Service Coverage Ratio</span>
                  <span className="font-bold text-lg text-orange-600">
                    {metrics.debtServiceRatio.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-semibold text-xl mb-4">Monthly Revenue</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rent Income:</span>
                  <span className="font-semibold text-green-600">
                    ${metrics.totalRent.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="text-sm text-gray-500 mb-2">Breakdown by unit:</div>
                  {property.units.map((unit, index) => {
                    const rent = unit.vacancyStatus === 'Vacant' ? (unit.projectedRent || 0) : unit.rentAmount;
                    return (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span>{unit.unitType} ({unit.vacancyStatus}):</span>
                        <span>${rent.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-semibold text-xl mb-4">Monthly Expenses</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Taxes:</span>
                  <span>${property.property_taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <span>${property.insurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hydro:</span>
                  <span>${property.hydro.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas:</span>
                  <span>${property.gas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Water:</span>
                  <span>${property.water.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Waste Management:</span>
                  <span>${property.waste_management.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maintenance:</span>
                  <span>${property.maintenance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Management Fees:</span>
                  <span>${property.management_fees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Miscellaneous:</span>
                  <span>${property.miscellaneous.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span className="text-gray-700">Total Expenses:</span>
                  <span className="text-red-600">${metrics.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span className="text-gray-700">Mortgage Payment:</span>
                  <span className="text-red-600">${Math.round(metrics.monthlyPayment).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-xl mb-4">Agent Contact</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{property.agent_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <a href={`mailto:${property.agent_email}`} className="ml-2 text-primary-600 hover:text-primary-800">
                    {property.agent_email}
                  </a>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <a href={`tel:${property.agent_phone}`} className="ml-2 text-primary-600 hover:text-primary-800">
                    {property.agent_phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
