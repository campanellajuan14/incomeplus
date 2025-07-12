import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, TrendingUp, ChevronLeft, ChevronRight, Heart, MessageSquare } from 'lucide-react';
import { calculatePropertyMetrics, calculateDynamicCashFlow, MortgageParams } from '../utils/mortgageCalculations';
import { PropertyFilters } from '../types/filters';
import { Property } from '../types/property';
import OptimizedImage from './OptimizedImage';
import ContactAgentModal from './ContactAgentModal';

type Unit = {
  id: string;
  unitType: 'Bachelor' | '1 Bedroom' | '2 Bedroom' | '3 Bedroom+' | 'Other';
  rentAmount: number;
  rentCategory: 'Market Value' | 'Under Market Value';
  vacancyStatus: 'Occupied' | 'Vacant';
  projectedRent?: number;
};

interface EnhancedPropertyCardProps {
  property: Property & { user_id?: string }; // Extended property with user_id for agent contact
  dynamicMortgageParams?: MortgageParams; // New optional prop for dynamic calculations
  currentFilters?: PropertyFilters; // Add current filters to preserve all search criteria
  isSaved?: boolean; // Whether the property is saved
  onToggleSaved?: (propertyId: string) => void; // Callback for toggling saved status
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ 
  property, 
  dynamicMortgageParams,
  currentFilters,
  isSaved = false,
  onToggleSaved
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const images = property.images || [];

  // Use dynamic mortgage parameters if provided, otherwise fall back to property defaults
  const mortgageParams: MortgageParams = dynamicMortgageParams || {
    mortgageRate: property.mortgage_rate || 4.0,
    amortizationPeriod: property.amortization_period || 25,
    downPaymentType: property.down_payment_type || 'Percent',
    downPaymentValue: property.down_payment_amount || 20,
    purchasePrice: property.purchase_price
  };

  // Calculate metrics using the mortgage parameters
  const metrics = calculatePropertyMetrics(property, mortgageParams);
  
  // Calculate dynamic cash flow using current filter inputs
  const dynamicCashFlow = dynamicMortgageParams 
    ? calculateDynamicCashFlow(property, dynamicMortgageParams)
    : metrics.monthlyCashFlow;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-500 text-white';
      case 'under_contract':
        return 'bg-warning-500 text-white';
      case 'sold':
        return 'bg-error-500 text-white';
      default:
        return 'bg-success-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'under_contract':
        return 'Under Contract';
      case 'sold':
        return 'Sold';
      default:
        return 'Active';
    }
  };

  const handleCardClick = () => {
    // If we have current filters, pass them all as query parameters
    if (currentFilters) {
      const searchParams = new URLSearchParams();
      
      // Add all current filter values to URL parameters
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'All') {
          searchParams.set(key, value.toString());
        }
      });
      
      if (searchParams.toString()) {
        navigate(`/properties/${property.id}?${searchParams.toString()}`);
      } else {
        navigate(`/properties/${property.id}`);
      }
    } else {
      navigate(`/properties/${property.id}`);
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
      >
      <div className="relative">
        {images.length > 0 ? (
          <div className="relative h-48 overflow-hidden">
            <OptimizedImage
              src={images[currentImageIndex]}
              alt={`${property.property_title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
              placeholder="blur"
              priority={currentImageIndex === 0}
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 transition-all duration-200 z-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 transition-all duration-200 z-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}


            {/* Status Badge */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium z-10 ${getStatusColor(property.status || 'active')}`}>
              {getStatusLabel(property.status || 'active')}
            </div>

            {/* Save/Unsave Button */}
            {onToggleSaved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSaved(property.id);
                }}
                className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
                  isSaved 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart 
                  className="h-4 w-4" 
                  fill={isSaved ? 'currentColor' : 'none'}
                />
              </button>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 flex items-center space-x-2 z-10">
                <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {images.length}
                </div>
                <div className="flex space-x-1">
                  {images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={(e) => goToImage(index, e)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-sm">No Image Available</div>
            
            {/* Status Badge for cards without images */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium z-10 ${getStatusColor(property.status || 'active')}`}>
              {getStatusLabel(property.status || 'active')}
            </div>
            
            {/* Save/Unsave Button for cards without images */}
            {onToggleSaved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSaved(property.id);
                }}
                className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
                  isSaved 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-red-500 border border-gray-300'
                }`}
              >
                <Heart 
                  className="h-4 w-4" 
                  fill={isSaved ? 'currentColor' : 'none'}
                />
              </button>
            )}
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
          <span className="mr-4">{property.units?.filter((u: Unit) => u.vacancyStatus === 'Occupied').length || 0} Occupied</span>
          <span>{property.units?.filter((u: Unit) => u.vacancyStatus === 'Vacant').length || 0} Vacant</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div className={`${dynamicCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <div className="font-medium">${Math.round(dynamicCashFlow || 0).toLocaleString()}/mo</div>
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

        {/* New Key Metrics Row */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div className="text-indigo-600">
            <div className="font-medium">${Math.round(metrics?.yearlyPrincipalPaydown || 0).toLocaleString()}/yr</div>
            <div className="text-xs text-gray-500">Principal Paydown</div>
          </div>
          <div className="text-emerald-600">
            <div className="font-medium">{(metrics?.fullYearlyROI || 0).toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Full Yearly ROI</div>
          </div>
        </div>

        <div className="border-t pt-2 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Monthly Rent:</span>
            <span className="text-green-600 font-medium">${(metrics?.totalRent || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Expenses:</span>
            <span className="text-red-600 font-medium">${(metrics?.totalExpenses || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Mortgage:</span>
            <span className="text-red-600 font-medium">${Math.round(metrics?.monthlyPayment || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t pt-2">
          <div className="flex items-center justify-between mb-3">
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
          
          {/* Contact Agent Button */}
          {property.user_id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowContactModal(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Agent
            </button>
          )}
        </div>
      </div>
      </div>
      
      {/* Contact Agent Modal */}
      <ContactAgentModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        property={{
          id: property.id,
          property_title: property.property_title,
          agent_name: property.agent_name,
          agent_email: property.agent_email,
          user_id: property.user_id || ''
        }}
      />
    </>
  );
};

export default EnhancedPropertyCard;
