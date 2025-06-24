
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useGeocoding = () => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  const geocodeProperty = async (propertyId: string, address: string, city: string, province: string, postalCode?: string) => {
    setIsGeocoding(true);
    setGeocodingError(null);

    try {
      const { data, error } = await supabase.functions.invoke('geocode-property', {
        body: {
          propertyId,
          address,
          city,
          province,
          postalCode
        }
      });

      if (error) {
        console.error('Geocoding error:', error);
        setGeocodingError('Failed to geocode property address');
        return { success: false, error: error.message };
      }

      if (data.error) {
        console.error('Geocoding service error:', data.error);
        setGeocodingError(data.error);
        return { success: false, error: data.error };
      }

      console.log('Property geocoded successfully:', data);
      return { 
        success: true, 
        latitude: data.latitude, 
        longitude: data.longitude 
      };

    } catch (err) {
      console.error('Geocoding request failed:', err);
      setGeocodingError('Network error during geocoding');
      return { success: false, error: 'Network error' };
    } finally {
      setIsGeocoding(false);
    }
  };

  return {
    geocodeProperty,
    isGeocoding,
    geocodingError
  };
};
