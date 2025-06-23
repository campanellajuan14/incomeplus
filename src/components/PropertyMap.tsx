import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import LoadingSpinner from './LoadingSpinner';
import { Property } from '../types/property';

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (property: Property) => void;
  height?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  enableClustering?: boolean;
  autoFit?: boolean;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  onPropertySelect,
  height = '400px',
  center = { lat: 43.6532, lng: -79.3832 }, // Toronto default
  zoom = 10,
  enableClustering = false,
  autoFit = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markerClusterRef = useRef<any>(null);
  const { isLoaded, error } = useGoogleMaps();
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
    });

    mapInstanceRef.current = map;
    setIsMapReady(true);
  }, [isLoaded, center, zoom]);

  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.google || !window.google.maps.marker) return;

    // Clear existing markers and cluster
    markersRef.current.forEach(marker => {
      if (marker.map) {
        marker.map = null;
      }
    });
    markersRef.current = [];
    
    if (markerClusterRef.current) {
      markerClusterRef.current.clearMarkers();
    }

    // Create bounds for auto-fitting
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidMarkers = false;

    // Add markers for each property
    const geocoder = new window.google.maps.Geocoder();
    let processedCount = 0;

    properties.forEach(property => {
      const fullAddress = `${property.address}, ${property.city}, ${property.province}, ${property.postal_code}`;

      geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
        processedCount++;
        
        if (status === 'OK' && results[0]) {
          const position = results[0].geometry.location;
          
          // Create custom marker element
          const markerElement = document.createElement('div');
          markerElement.innerHTML = `
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: ${selectedPropertyId === property.id ? '#ef4444' : '#3b82f6'};
              border: 4px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${property.number_of_units}
            </div>
          `;

          // Create AdvancedMarkerElement
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: enableClustering ? null : mapInstanceRef.current,
            position: position,
            content: markerElement,
            title: property.property_title
          });

          // Create enhanced info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-4 max-w-sm">
                ${property.images.length > 0 ? `
                  <img src="${property.images[0]}" alt="${property.property_title}" class="w-full h-32 object-cover rounded-lg mb-3">
                ` : ''}
                <h3 class="font-semibold text-lg mb-2 text-gray-800">${property.property_title}</h3>
                <p class="text-sm text-gray-600 mb-2">
                  <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                  ${property.address}
                </p>
                <p class="text-sm text-gray-600 mb-3">${property.city}, ${property.province}</p>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-600">
                    <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    ${property.number_of_units} units
                  </span>
                  <span class="font-bold text-lg text-blue-600">$${property.purchase_price.toLocaleString()}</span>
                </div>
                <button 
                  onclick="window.dispatchEvent(new CustomEvent('propertySelect', {detail: '${property.id}'}))"
                  class="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            `
          });

          // Add click listener to marker
          marker.addListener('click', () => {
            // Close other info windows
            markersRef.current.forEach(m => {
              if (m.infoWindow) {
                m.infoWindow.close();
              }
            });
            
            infoWindow.open(mapInstanceRef.current, marker);
            
            if (onPropertySelect) {
              onPropertySelect(property);
            }
          });

          // Store reference to marker and info window
          marker.infoWindow = infoWindow;
          marker.propertyId = property.id;
          markersRef.current.push(marker);

          // Add to bounds
          bounds.extend(position);
          hasValidMarkers = true;

          // Open info window for selected property
          if (selectedPropertyId === property.id) {
            infoWindow.open(mapInstanceRef.current, marker);
          }

          // Handle clustering and auto-fit after all properties are processed
          if (processedCount === properties.length) {
            if (enableClustering && window.MarkerClusterer) {
              markerClusterRef.current = new window.MarkerClusterer({
                map: mapInstanceRef.current,
                markers: markersRef.current,
                gridSize: 60,
                maxZoom: 15
              });
            }

            // Auto-fit map to show all markers
            if (autoFit && hasValidMarkers && properties.length > 1) {
              mapInstanceRef.current.fitBounds(bounds);
              
              // Set a maximum zoom level to prevent zooming too close
              const maxZoom = properties.length === 1 ? 15 : 13;
              const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
                if (mapInstanceRef.current.getZoom() > maxZoom) {
                  mapInstanceRef.current.setZoom(maxZoom);
                }
                window.google.maps.event.removeListener(listener);
              });
            }
          }
        }
      });
    });

    // Listen for property selection events from info windows
    const handlePropertySelect = (event: any) => {
      const propertyId = event.detail;
      const property = properties.find(p => p.id === propertyId);
      if (property && onPropertySelect) {
        onPropertySelect(property);
      }
    };

    window.addEventListener('propertySelect', handlePropertySelect);

    return () => {
      window.removeEventListener('propertySelect', handlePropertySelect);
    };
  }, [isMapReady, properties, selectedPropertyId, onPropertySelect, enableClustering, autoFit]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Failed to load map</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <LoadingSpinner isVisible={true} message="Loading map..." variant="inline" />
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} style={{ height }} className="w-full" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <LoadingSpinner isVisible={true} message="Initializing map..." variant="inline" />
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
