
import React, { useState } from 'react';
import { MapPin, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface EnhancedPropertyCardProps {
  property: any;
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const metrics = property.calculatedMetrics;
  const images = property.images || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200">
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
                      onClick={() => goToImage(index)}
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
          <span className="mr-4">{property.units?.filter((u: any) => u.vacancyStatus === 'Occupied').length || 0} Occupied</span>
          <span>{property.units?.filter((u: any) => u.vacancyStatus === 'Vacant').length || 0} Vacant</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div className={`${metrics?.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <div className="font-medium">${Math.round(metrics?.monthlyCashFlow || 0)}/mo</div>
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
            <div className="font-medium">{(metrics?.debtServiceRatio || 0).toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Debt Service</div>
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
