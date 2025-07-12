import React, { useState, useEffect } from 'react';
import { Heart, Search, Mail, Trash2, Bell, Edit3, DollarSign, MapPin } from 'lucide-react';
import { SavedSearch } from '../../types/dashboard';
import { Property } from '../../types/property';
import EnhancedPropertyCard from '../EnhancedPropertyCard';
import { useSavedProperties } from '../../hooks/useSavedProperties';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';

interface SavedPropertyWithDetails extends Property {
  saved_notes?: string;
  saved_at: string;
}

const SavedProperties: React.FC = () => {
  const { user } = useAuth();
  const { unsaveProperty } = useSavedProperties();
  const [savedProperties, setSavedProperties] = useState<SavedPropertyWithDetails[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'searches'>('properties');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved properties with full property details
  const fetchSavedProperties = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select(`
          id,
          notes,
          created_at,
          properties (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved properties:', error);
        return;
      }

      const propertiesWithSavedInfo = data?.map(saved => ({
        ...saved.properties,
        saved_notes: saved.notes,
        saved_at: saved.created_at
      })).filter(prop => prop.id) as SavedPropertyWithDetails[];

      setSavedProperties(propertiesWithSavedInfo || []);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  };

  // Fetch saved searches
  const fetchSavedSearches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved searches:', error);
        return;
      }

      setSavedSearches((data || []).filter(search => search.user_id) as SavedSearch[]);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSavedProperties(), fetchSavedSearches()]);
      setIsLoading(false);
    };

    if (user) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Handle removing a saved property
  const handleRemoveProperty = async (propertyId: string) => {
    const result = await unsaveProperty(propertyId);
    if (result.success) {
      setSavedProperties(prev => prev.filter(prop => prop.id !== propertyId));
    }
  };

  // Handle contacting agent
  const handleContactAgent = (property: SavedPropertyWithDetails) => {
    const subject = encodeURIComponent(`Inquiry about ${property.property_title}`);
    const body = encodeURIComponent(`Hi ${property.agent_name},\n\nI'm interested in your property listing: ${property.property_title} at ${property.address}, ${property.city}, ${property.province}.\n\nCould you please provide more information?\n\nThank you!`);
    window.open(`mailto:${property.agent_email}?subject=${subject}&body=${body}`);
  };

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
              <button 
                onClick={() => window.location.href = '/properties'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((property) => (
                <div key={property.id} className="relative">
                  <EnhancedPropertyCard
                    property={property}
                    isSaved={true}
                    onToggleSaved={() => handleRemoveProperty(property.id)}
                  />
                  
                  {/* Additional overlay with notes and actions */}
                  <div className="absolute top-2 right-12 flex space-x-1 z-20">
                    <button
                      onClick={() => handleContactAgent(property)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                      title="Contact Agent"
                    >
                      <Mail size={16} className="text-blue-600" />
                    </button>
                  </div>

                  {/* Notes overlay if there are notes */}
                  {property.saved_notes && (
                    <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-sm z-10">
                      <p className="text-xs text-gray-700 line-clamp-2">{property.saved_notes}</p>
                    </div>
                  )}

                  {/* Saved date */}
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 z-10">
                    <span className="text-xs text-gray-600">
                      Saved {new Date(property.saved_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
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