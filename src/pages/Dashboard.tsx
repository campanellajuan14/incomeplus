import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ExternalLink, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import PropertyFilters from '../components/PropertyFilters';
import EnhancedPropertyCard from '../components/EnhancedPropertyCard';
import { usePropertySearch } from '../hooks/usePropertySearch';

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
  purchase_price: number;
  number_of_units: number;
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
  images: string[];
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
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllProperties, setShowAllProperties] = useState(false);

  const {
    filters,
    setFilters,
    filteredProperties,
    handleSearch,
    isFiltersExpanded,
    setIsFiltersExpanded
  } = usePropertySearch(allProperties);

  useEffect(() => {
    if (user) {
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
          purchase_price: item.purchase_price,
          number_of_units: item.number_of_units,
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
          images: Array.isArray(item.images) ? item.images as string[] : [],
          created_at: item.created_at
        }));

        setAllProperties(transformedProperties);
      } else {
        setAllProperties([]);
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setAllProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which properties to display
  const displayProperties = showAllProperties ? filteredProperties : filteredProperties.slice(0, 6);
  
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

        <PropertyFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          isExpanded={isFiltersExpanded}
          onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
        />

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Found {filteredProperties.length} properties
            {filteredProperties.length !== allProperties.length && ` of ${allProperties.length} total`}
          </div>
          {filteredProperties.length > 6 && !showAllProperties && (
            <button
              onClick={() => setShowAllProperties(true)}
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              Show all {filteredProperties.length} results
            </button>
          )}
          {showAllProperties && (
            <button
              onClick={() => setShowAllProperties(false)}
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              Show featured only
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading properties...
            </div>
          ) : (
            <>
              {!showAllProperties && <NewPropertyCard />}
              {displayProperties.map(property => (
                <EnhancedPropertyCard key={property.id} property={property} />
              ))}
            </>
          )}
        </div>

        {showAllProperties && (
          <div className="mt-6 text-center">
            <NewPropertyCard />
          </div>
        )}
        
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
