import React, { useState, useEffect } from 'react';
import { Heart, Search, Bell, Trash2, Edit3, MapPin, DollarSign } from 'lucide-react';
import { SavedProperty, SavedSearch } from '../../types/dashboard';
import { Property } from '../../types/property';

const SavedProperties: React.FC = () => {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'searches'>('properties');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setSavedProperties([
        // Mock data - replace with actual API calls
      ]);
      setSavedSearches([
        // Mock data - replace with actual API calls
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const SavedPropertyCard: React.FC<{ savedProperty: SavedProperty }> = ({ savedProperty }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Sample Property Title
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin size={16} className="mr-1" />
              <span className="text-sm">123 Main Street, Toronto, ON</span>
            </div>
            <div className="flex items-center text-green-600">
              <DollarSign size={16} className="mr-1" />
              <span className="font-semibold">$850,000</span>
            </div>
          </div>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <Heart size={20} fill="currentColor" />
          </button>
        </div>
        
        {savedProperty.notes && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{savedProperty.notes}</p>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Saved {new Date(savedProperty.created_at).toLocaleDateString()}</span>
          <span>2 bed • 2 bath</span>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            View Details
          </button>
          <button className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Edit3 size={16} />
          </button>
          <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const SavedSearchCard: React.FC<{ savedSearch: SavedSearch }> = ({ savedSearch }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{savedSearch.name}</h3>
          <div className="space-y-1">
            {savedSearch.search_criteria.location?.city && (
              <div className="flex items-center text-gray-600">
                <MapPin size={14} className="mr-2" />
                <span className="text-sm">{savedSearch.search_criteria.location.city}</span>
              </div>
            )}
            {savedSearch.search_criteria.price_range && (
              <div className="flex items-center text-gray-600">
                <DollarSign size={14} className="mr-2" />
                <span className="text-sm">
                  ${savedSearch.search_criteria.price_range.min?.toLocaleString()} - 
                  ${savedSearch.search_criteria.price_range.max?.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
            savedSearch.email_notifications 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <Bell size={12} className="mr-1" />
            {savedSearch.email_notifications ? 'Active' : 'Inactive'}
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Edit3 size={16} />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>Created {new Date(savedSearch.created_at).toLocaleDateString()}</span>
        <span>Updated {new Date(savedSearch.updated_at).toLocaleDateString()}</span>
      </div>
      
      <div className="flex space-x-2">
        <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
          View Results
        </button>
        <button className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
          <Bell size={16} />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex space-x-4 border-b border-gray-200">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
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
      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'properties'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart size={16} className="inline mr-2" />
          Saved Properties ({savedProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('searches')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'searches'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search size={16} className="inline mr-2" />
          Saved Searches ({savedSearches.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'properties' ? (
        <div>
          {savedProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Heart size={32} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Properties</h3>
              <p className="text-gray-600 mb-6">
                Start saving properties you're interested in to easily access them later.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Browse Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((savedProperty) => (
                <SavedPropertyCard key={savedProperty.id} savedProperty={savedProperty} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {savedSearches.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search size={32} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Searches</h3>
              <p className="text-gray-600 mb-6">
                Create saved searches to get notified when new properties match your criteria.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Search Alert
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedSearches.map((savedSearch) => (
                <SavedSearchCard key={savedSearch.id} savedSearch={savedSearch} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedProperties; 