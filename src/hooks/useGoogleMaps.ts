import { useState, useEffect, useRef } from 'react';
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
  const loadingRef = useRef(false);
  const apiKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Prevent multiple simultaneous loading attempts
    if (loadingRef.current) {
      return;
    }

    // Load Google Maps API
    const loadGoogleMaps = async () => {
      try {
        loadingRef.current = true;

        // Only fetch API key if we don't have it cached
        let apiKey = apiKeyRef.current;
        if (!apiKey) {
          const { data, error } = await supabase.functions.invoke('get-maps-key');
          
          if (error || !data?.apiKey) {
            throw new Error('Failed to get Google Maps API key');
          }
          
          apiKey = data.apiKey;
          apiKeyRef.current = apiKey; // Cache the API key
        }

        // Check if script already exists and has the correct API key
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          const scriptSrc = existingScript.getAttribute('src');
          if (scriptSrc && apiKey && scriptSrc.includes(apiKey)) {
            // Script with correct API key already exists, just wait for it to load
            if (window.google && window.google.maps) {
              setIsLoaded(true);
            } else {
              // Wait for existing script to load
              existingScript.addEventListener('load', () => {
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
                
                // Only add if not already present
                if (!document.querySelector('script[src*="markerclusterer"]')) {
                  document.head.appendChild(clustererScript);
                }
              });
            }
            return;
          } else {
            // Remove script with wrong API key
            existingScript.remove();
          }
        }

        // Create and load main Google Maps script with marker library and async loading
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places,marker&loading=async`;
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
          
          // Only add if not already present
          if (!document.querySelector('script[src*="markerclusterer"]')) {
            document.head.appendChild(clustererScript);
          }
        };
        
        script.onerror = () => {
          setError('Failed to load Google Maps');
          loadingRef.current = false;
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        loadingRef.current = false;
      }
    };

    loadGoogleMaps();
  }, []); // Empty dependency array - only run once

  return { isLoaded, error };
};
