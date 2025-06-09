import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculatePropertyMetrics, calculateDynamicCashFlow, MortgageParams } from '../utils/mortgageCalculations';

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

interface EnhancedPropertyCardProps {
  property: Property;
  dynamicMortgageParams?: MortgageParams; // New optional prop for dynamic calculations
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ 
  property, 
  dynamicMortgageParams 
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const handleCardClick = () => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
    >
      <div className="relative">
        {images.length > 0 && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={images[currentImageIndex]} 
              alt={`${property.property_title} - Image ${currentImageIndex + 1}`} 
              className="w-full h-full object-cover transition-all duration-300"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 transition-all duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <div className="absolute bottom-2 left-2 bg-green-500 rounded-full p-1">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 flex items-center space-x-2">
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
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg text-blue-600">
                ${property.purchase_price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Purchase Price</div>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{property.income_type} Income</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPropertyCard;
