
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, ArrowUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';

// Property data structure matching the Supabase table
type Property = {
  id?: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearbuilt: number;
  caprate: number;
  cashflow: number;
  cocreturn: number;
  user_id: string;
  created_at?: string;
};

// List of US states for dropdown
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", 
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const PropertyUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [property, setProperty] = useState<Omit<Property, 'user_id' | 'id' | 'created_at'>>({
    address: '',
    city: '',
    state: 'California', // Default state
    zipcode: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    yearbuilt: new Date().getFullYear(), // Default to current year
    caprate: 0,
    cashflow: 0,
    cocreturn: 0
  });
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    const numericFields = ['price', 'bedrooms', 'bathrooms', 'sqft', 'yearbuilt', 'caprate', 'cashflow', 'cocreturn'];
    const newValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;
    
    setProperty(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add properties');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user_id to property data
      const propertyData = {
        ...property,
        user_id: user.id
      };
      
      // Insert property into Supabase
      const { error: supabaseError } = await supabase
        .from('properties')
        .insert(propertyData);
      
      if (supabaseError) throw supabaseError;
      
      setSuccess('Property added successfully!');
      
      // Reset form after successful submission
      setProperty({
        address: '',
        city: '',
        state: 'California',
        zipcode: '',
        price: 0,
        bedrooms: 0,
        bathrooms: 0,
        sqft: 0,
        yearbuilt: new Date().getFullYear(),
        caprate: 0,
        cashflow: 0,
        cocreturn: 0
      });
      
      // Redirect to property sheet after a brief delay
      setTimeout(() => {
        navigate('/properties');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error adding property:', err);
      setError(`Failed to add property: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-primary-700 mb-2">Add New Property</h1>
          <p className="text-gray-600">
            Enter the property details to add it to your portfolio.
          </p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <Check className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-800 border-b pb-2">Property Details</h2>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={property.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={property.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={property.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      {US_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={property.zipcode}
                    onChange={handleChange}
                    pattern="[0-9]{5}"
                    title="Five digit zip code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={property.price || ''}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-800 border-b pb-2">Property Features</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      id="bedrooms"
                      name="bedrooms"
                      value={property.bedrooms || ''}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      id="bathrooms"
                      name="bathrooms"
                      value={property.bathrooms || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="sqft" className="block text-sm font-medium text-gray-700 mb-1">
                      Square Feet
                    </label>
                    <input
                      type="number"
                      id="sqft"
                      name="sqft"
                      value={property.sqft || ''}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="yearbuilt" className="block text-sm font-medium text-gray-700 mb-1">
                    Year Built
                  </label>
                  <input
                    type="number"
                    id="yearbuilt"
                    name="yearbuilt"
                    value={property.yearbuilt || ''}
                    onChange={handleChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <h2 className="text-lg font-medium text-gray-800 border-b pb-2 mt-6">Financial Details</h2>
                
                <div>
                  <label htmlFor="caprate" className="block text-sm font-medium text-gray-700 mb-1">
                    Cap Rate (%)
                  </label>
                  <input
                    type="number"
                    id="caprate"
                    name="caprate"
                    value={property.caprate || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cashflow" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Cash Flow ($)
                  </label>
                  <input
                    type="number"
                    id="cashflow"
                    name="cashflow"
                    value={property.cashflow || ''}
                    onChange={handleChange}
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cocreturn" className="block text-sm font-medium text-gray-700 mb-1">
                    Cash on Cash Return (%)
                  </label>
                  <input
                    type="number"
                    id="cocreturn"
                    name="cocreturn"
                    value={property.cocreturn || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/properties')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded text-white flex items-center ${
                  isLoading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isLoading ? 'Adding...' : (
                  <>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Add Property
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyUpload;
