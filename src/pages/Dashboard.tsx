
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tags, PlusCircle, ExternalLink, FileSpreadsheet } from 'lucide-react';

const PropertyCard = ({ property }: { property: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {property.image && (
          <img 
            src={property.image} 
            alt={property.title} 
            className="w-full h-40 object-cover responsive-img"
          />
        )}
        {property.label && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs uppercase font-semibold px-2 py-1 rounded">
            {property.label}
          </div>
        )}
        {property.status && (
          <div className="absolute bottom-2 left-2 bg-green-500 rounded-full p-1">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800">{property.title}</h3>
        <p className="text-gray-600 text-sm">{property.address}</p>
        <div className="flex flex-wrap mt-2 text-sm text-gray-600">
          <div className="mr-4 mb-1">
            <span>House</span>
          </div>
          <div className="mr-4 mb-1">
            <span>{property.beds} Beds</span>
          </div>
          <div className="mb-1">
            <span>{property.baths} Baths</span>
          </div>
          <div className="ml-auto mb-1">
            <span>{property.sqft} Sq.Ft.</span>
          </div>
        </div>
        <div className="flex flex-wrap mt-2 border-t pt-2 text-sm">
          <div className="text-gray-500 mr-2 mb-1">
            ${property.cashFlow}/mo Cash Flow
          </div>
          <div className="text-blue-500 mr-2 mb-1">
            {property.capRate}% Cap Rate
          </div>
          <div className="text-blue-500 mb-1">
            {property.coc}% COC
          </div>
        </div>
        <div className="mt-2">
          <div className="font-semibold text-lg text-blue-600">
            ${property.price.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Purchase Price</div>
        </div>
      </div>
    </div>
  );
};

const NewPropertyCard = () => {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-full min-h-[250px] text-center hover:bg-gray-100 transition-colors cursor-pointer touch-target">
      <div className="bg-gray-200 rounded-full p-4 mb-4">
        <PlusCircle className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="font-medium text-lg text-gray-700">Add a New Rental Property</h3>
      <p className="text-gray-500 text-sm mt-2 max-w-xs">
        Click here to analyze a new rental property or copy an existing one.
      </p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [properties] = useState<any[]>([
    {
      id: 1,
      title: "Example: Rental Property",
      address: "2629 Bonnybrook Dr SW, Atlanta, GA 30311",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      beds: 3,
      baths: 2,
      sqft: "1,050",
      cashFlow: 211,
      capRate: "7.2",
      coc: "8.6",
      price: 105000,
      label: "SAMPLE",
      status: true
    }
  ]);
  
  return (
    <div className="pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary-700 mb-2">Rental Properties</h1>
            <p className="text-gray-600">
              Properties you plan to buy and hold for long-term cash flow, including short-term rentals.
            </p>
          </div>
          <div className="flex mt-4 md:mt-0 w-full md:w-auto">
            <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-50 touch-target w-1/2 md:w-auto">
              <span>Compare</span>
            </button>
            <button className="bg-primary-500 text-white px-3 py-2 rounded hover:bg-primary-600 flex items-center justify-center touch-target w-1/2 md:w-auto">
              <PlusCircle className="h-4 w-4 mr-1 md:mr-2" />
              <span>Add Property</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex w-full md:w-auto mb-2 md:mb-0">
            <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center touch-target">
              <Tags className="h-3 w-3 mr-1" />
              Tags
            </button>
          </div>
          <div className="relative grow md:max-w-md w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="search" 
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm touch-target" 
              placeholder="Search properties..." 
            />
          </div>
          <div className="flex items-center ml-auto flex-wrap">
            <button className="text-blue-600 mr-4 text-sm hover:text-blue-800 touch-target">
              Export
            </button>
            <div className="flex items-center">
              <label className="text-sm mr-2 text-gray-600">Sort by:</label>
              <select className="text-sm border-none bg-transparent text-gray-800 focus:outline-none touch-target">
                <option>Name</option>
                <option>Price</option>
                <option>Date Added</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
          <NewPropertyCard />
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-primary-700 mb-2">Property Spreadsheet</h2>
              <p className="text-gray-600">
                Manage multiple properties in a spreadsheet format. Import or export property data in bulk.
              </p>
            </div>
            <Link
              to="/properties"
              className="mt-4 md:mt-0 bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded flex items-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Open Property Sheet
            </Link>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-primary-200 transition-colors">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="bg-primary-100 p-3 rounded-lg mb-4 md:mb-0 md:mr-6">
                <FileSpreadsheet className="h-8 w-8 text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Bulk Property Management</h3>
                <p className="text-gray-600 mb-4">
                  Import property data from CSV files, manage them in a spreadsheet view, and export them for your records.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/properties"
                    className="text-primary-600 hover:text-primary-800 flex items-center"
                  >
                    <span>Go to Property Sheet</span>
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 md:mt-16 text-center">
          <a href="#" className="inline-flex items-center text-primary-600 hover:text-primary-800 touch-target">
            Learn how to analyze investment properties with IncomePlus
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
