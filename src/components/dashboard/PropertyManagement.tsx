import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, TrendingUp, Edit, Eye } from 'lucide-react';
import { Property } from '../../types/property';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { calculatePropertyMetrics } from '../../utils/mortgageCalculations';
import OptimizedImage from '../OptimizedImage';

type PropertyStatus = 'active' | 'under_contract' | 'sold';

const PropertyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProperties();
    }
  }, [user]);

  const fetchUserProperties = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      if (data) {
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
          status: item.status as PropertyStatus || 'active'
        }));

        setProperties(transformedProperties);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId: string, newStatus: PropertyStatus) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Error updating property status:', error);
        return;
      }

      setProperties(prev => prev.map(property => 
        property.id === propertyId 
          ? { ...property, status: newStatus }
          : property
      ));
    } catch (err) {
      console.error('Error updating property status:', err);
    }
  };

  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case 'sold': return 'bg-green-100 text-green-800 border-green-200';
      case 'under_contract': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusLabel = (status: PropertyStatus) => {
    switch (status) {
      case 'sold': return 'Sold';
      case 'under_contract': return 'Under Contract';
      default: return 'Active';
    }
  };

  const PropertyCard: React.FC<{ property: Property & { status?: PropertyStatus } }> = ({ property }) => {
    const images = property.images || [];
    const currentImageIndex = 0;
    
    const mortgageParams = {
      mortgageRate: property.mortgage_rate || 4.0,
      amortizationPeriod: property.amortization_period || 25,
      downPaymentType: property.down_payment_type || 'Percent',
      downPaymentValue: property.down_payment_amount || 20,
      purchasePrice: property.purchase_price
    };

    const metrics = calculatePropertyMetrics(property, mortgageParams);

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          {images.length > 0 ? (
            <div className="relative h-48 overflow-hidden">
              <OptimizedImage
                src={images[currentImageIndex]}
                alt={`${property.property_title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                placeholder="blur"
                priority={currentImageIndex === 0}
              />
              
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status || 'active')}`}>
                {getStatusLabel(property.status || 'active')}
              </div>

              {images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-48 bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-sm">No Image Available</div>
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status || 'active')}`}>
                {getStatusLabel(property.status || 'active')}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-1">{property.property_title}</h3>
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{property.address}, {property.city}, {property.province}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Users className="h-3 w-3 mr-1" />
            <span className="mr-4">{property.number_of_units} Units</span>
            <span className="mr-4">{property.units?.filter(u => u.vacancyStatus === 'Occupied').length || 0} Occupied</span>
            <span>{property.units?.filter(u => u.vacancyStatus === 'Vacant').length || 0} Vacant</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div className={`${(metrics?.monthlyCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div className="font-medium">${Math.round(metrics?.monthlyCashFlow || 0).toLocaleString()}/mo</div>
              <div className="text-xs text-gray-500">Cash Flow</div>
            </div>
            <div className="text-blue-600">
              <div className="font-medium">{(metrics?.roi || 0).toFixed(1)}%</div>
              <div className="text-xs text-gray-500">ROI</div>
            </div>
            <div className="text-purple-600">
              <div className="font-medium">{(metrics?.capRate || 0).toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Cap Rate</div>
            </div>
            <div className="text-orange-600">
              <div className="font-medium">{(metrics?.debtServiceRatio || 0).toFixed(2)}x</div>
              <div className="text-xs text-gray-500">DSCR</div>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="font-semibold text-lg text-blue-600">
                  ${property.purchase_price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Purchase Price</div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{property.income_type === 'Estimated' ? 'Projected' : property.income_type} Income</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={property.status || 'active'}
                onChange={(e) => updatePropertyStatus(property.id, e.target.value as PropertyStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="active">Active</option>
                <option value="under_contract">Under Contract</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/properties/upload?edit=${property.id}`)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Quick Edit
              </button>
              <button
                onClick={() => navigate(`/properties/${property.id}`)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
        <button 
          onClick={() => navigate('/properties/upload')}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar size={32} className="text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Yet</h3>
          <p className="text-gray-600 mb-6">
            Start building your real estate portfolio by adding your first property.
          </p>
          <button 
            onClick={() => navigate('/properties/upload')}
            className="flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mx-auto"
          >
            <Plus size={20} className="mr-2" />
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

    </div>
  );
};

export default PropertyManagement; 