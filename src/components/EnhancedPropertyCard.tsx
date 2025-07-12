import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, TrendingUp, ChevronLeft, ChevronRight, Heart, Eye, X } from 'lucide-react';
import { calculatePropertyMetrics, calculateDynamicCashFlow, MortgageParams } from '../utils/mortgageCalculations';
import { PropertyFilters } from '../types/filters';
import { Property } from '../types/property';
import OptimizedImage from './OptimizedImage';

type Unit = {
  id: string;
  unitType: 'Bachelor' | '1 Bedroom' | '2 Bedroom' | '3 Bedroom+' | 'Other';
  rentAmount: number;
  rentCategory: 'Market Value' | 'Under Market Value';
  vacancyStatus: 'Occupied' | 'Vacant';
  projectedRent?: number;
};

interface EnhancedPropertyCardProps {
  property: Property;
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
  const [isSlideShowOpen, setIsSlideShowOpen] = useState(false);
  const [slideShowIndex, setSlideShowIndex] = useState(0);
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
        return 'bg-green-500';
      case 'under_contract':
        return 'bg-yellow-500';
      case 'sold':
        return 'bg-red-500';
      default:
        return 'bg-red-500';
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

  const openSlideShow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideShowIndex(currentImageIndex);
    setIsSlideShowOpen(true);
  };

  const closeSlideShow = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsSlideShowOpen(false);
  };

  const nextSlideShowImage = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSlideShowIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlideShowImage = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSlideShowIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 cursor-pointer group"
      >
        <div className="relative">
        {images.length > 0 ? (
          <div className="relative h-48 overflow-hidden group/image">
            <OptimizedImage
              src={images[currentImageIndex]}
              alt={`${property.property_title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300 group-hover/image:blur-sm"
              placeholder="blur"
              priority={currentImageIndex === 0}
            />
            
            {/* Hover overlay with view icon */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={openSlideShow}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
              >
                <Eye className="h-6 w-6" />
              </button>
            </div>
            
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
            <div className="absolute -top-1 left-2 z-10 group-hover:animate-shake">
              {/* Hanging chains/strings using SVG icon */}
              <div className="flex justify-center">
                <img 
                  src="https://html.themeholy.com/piller/demo/assets/img/icon/sell_rent_icon.svg" 
                  alt="Hanging chains"
                  className="w-8 h-6 object-contain"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              {/* Tag - positioned to connect with chains */}
              <div className={`${getStatusColor(property.status || 'active')} text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-md -mt-2.5`}>
                {getStatusLabel(property.status || 'active')}
              </div>
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
            <div className="absolute top-0 left-2 z-10 group-hover:animate-shake">
              {/* Hanging chains/strings using SVG icon */}
              <div className="flex justify-center">
                <img 
                  src="https://html.themeholy.com/piller/demo/assets/img/icon/sell_rent_icon.svg" 
                  alt="Hanging chains"
                  className="w-8 h-6 object-contain"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              {/* Tag - positioned to connect with chains */}
              <div className={`${getStatusColor(property.status || 'active')} text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-md -mt-2.5`}>
                {getStatusLabel(property.status || 'active')}
              </div>
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
          <div className="flex items-center justify-between">
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
        </div>
      </div>
    </div>
    
    {/* Slideshow Modal - Moved outside card container */}
    {isSlideShowOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeSlideShow}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeSlideShow}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Previous button */}
            {images.length > 1 && (
              <button
                onClick={prevSlideShowImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200 z-10"
              >
                <ChevronLeft className="h-12 w-12" />
              </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                onClick={nextSlideShowImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200 z-10"
              >
                <ChevronRight className="h-12 w-12" />
              </button>
            )}

            {/* Main image */}
            <div className="max-w-4xl max-h-full">
              <img
                src={images[slideShowIndex]}
                alt={`${property.property_title} - Image ${slideShowIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full">
                {slideShowIndex + 1} / {images.length}
              </div>
            )}

            {/* Thumbnail navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideShowIndex(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === slideShowIndex 
                        ? 'border-white' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedPropertyCard;
