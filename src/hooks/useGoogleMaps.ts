
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

declare global {
  interface Window {
    google: any;
    MarkerClusterer: any;
    initMap: () => void;
  }
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps API
    const loadGoogleMaps = async () => {
      try {
        // Get API key from our edge function
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        
        if (error || !data?.apiKey) {
          throw new Error('Failed to get Google Maps API key');
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Create and load main Google Maps script with marker library and async loading
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry,places,marker&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          // Load MarkerClusterer after Google Maps is loaded
          const clustererScript = document.createElement('script');
          clustererScript.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
          clustererScript.onload = () => {
            setIsLoaded(true);
          };
          clustererScript.onerror = () => {
            console.warn('Failed to load MarkerClusterer, clustering will be disabled');
            setIsLoaded(true);
          };
          document.head.appendChild(clustererScript);
        };
        
        script.onerror = () => {
          setError('Failed to load Google Maps');
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
      }
    };

    loadGoogleMaps();
  }, []);

  return { isLoaded, error };
};
