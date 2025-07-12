import React, { useEffect, useRef, useState, memo } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import LoadingSpinner from './LoadingSpinner';
import { Property } from '../types/property';

interface PropertyMapProps {
  properties: (Property & { calculatedMetrics?: any })[];
  selectedPropertyId?: string;
  onPropertySelect?: (property: Property) => void;
  height?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  enableClustering?: boolean;
  autoFit?: boolean; // Default: true - automatically fits map to show all search results
}

const PropertyMap: React.FC<PropertyMapProps> = memo(({
  properties,
  selectedPropertyId,
  onPropertySelect,
  height = '400px',
  center = { lat: 43.6532, lng: -79.3832 }, // Toronto default
  zoom = 10,
  enableClustering = false,
  autoFit = false
}) => {
  // Auto-enable clustering for dense areas (10+ properties)
  const shouldCluster = enableClustering || properties.length >= 10;
  // Auto-fit map to show all search results by default
  const shouldAutoFit = autoFit !== false; // Default to true unless explicitly set to false
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

    // Filter properties that have valid coordinates
    const propertiesWithCoords = properties.filter(property => {
      const hasCoords = property.latitude && property.longitude && 
                       !isNaN(Number(property.latitude)) && !isNaN(Number(property.longitude)) &&
                       Number(property.latitude) !== 0 && Number(property.longitude) !== 0;
      
      if (!hasCoords) {
        console.log(`Property ${property.property_title} missing valid coordinates:`, {
          lat: property.latitude,
          lng: property.longitude
        });
      }
      
      return hasCoords;
    });

    console.log(`Displaying ${propertiesWithCoords.length} out of ${properties.length} properties with valid coordinates`);

    // Add markers for each property with valid coordinates
    propertiesWithCoords.forEach(property => {
      const latitude = Number(property.latitude);
      const longitude = Number(property.longitude);
      
      const position = new window.google.maps.LatLng(latitude, longitude);
      
      console.log(`Creating marker for ${property.property_title} at:`, { latitude, longitude });
      
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
        map: shouldCluster ? null : mapInstanceRef.current,
        position: position,
        content: markerElement,
        title: property.property_title
      });

      // Create clean minimal info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="
            width: 160px;
            background: #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 6px;
            overflow: hidden;
            font-family: -apple-system, sans-serif;
          ">
            ${property.images.length > 0 ? `
              <img 
                src="${property.images[0]}" 
                loading="lazy"
                style="
                  width: 100%;
                  height: 80px;
                  object-fit: cover;
                  display: block;
                  transition: opacity 0.3s ease;
                "
                onload="this.style.opacity='1'"
                onerror="this.style.display='none'"
              >
            ` : ''}
            <div style="padding: 12px;">
              <div style="
                font-size: 15px;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 6px;
                letter-spacing: -0.02em;
              ">
                $${property.purchase_price.toLocaleString()}
              </div>
              <div style="
                font-size: 10px;
                color: #888;
                line-height: 1.4;
                font-weight: 400;
              ">
                ${property.address}
              </div>
            </div>
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
    });

    // Handle clustering and auto-fit after all markers are added
    if (shouldCluster && markersRef.current.length > 0) {
      // Load MarkerClusterer dynamically if not available
      if (typeof window.MarkerClusterer === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
        script.onload = () => {
          createClusterer();
        };
        document.head.appendChild(script);
      } else {
        createClusterer();
      }
      
      function createClusterer() {
        if (markerClusterRef.current) {
          markerClusterRef.current.clearMarkers();
        }
        
        // Create custom cluster renderer for better styling
        const renderer = {
          render: ({ count, position }: any) => {
            const color = count > 10 ? '#dc2626' : count > 5 ? '#ea580c' : '#2563eb';
            const size = count > 20 ? 50 : count > 10 ? 45 : 40;
            
            return new window.google.maps.marker.AdvancedMarkerElement({
              position,
              content: createClusterIcon(count, color, size),
              zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count,
            });
          },
        };
        
        markerClusterRef.current = new (window as any).MarkerClusterer({
          map: mapInstanceRef.current,
          markers: markersRef.current,
          renderer: renderer,
          algorithm: new (window as any).markerClusterer.SuperClusterAlgorithm({
            radius: 80,
            maxZoom: 16,
            minPoints: 3
          })
        });
      }
      
      function createClusterIcon(count: number, color: string, size: number) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size.toString());
        svg.setAttribute('height', size.toString());
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', (size / 2).toString());
        circle.setAttribute('cy', (size / 2).toString());
        circle.setAttribute('r', (size / 2 - 2).toString());
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('opacity', '0.9');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (size / 2).toString());
        text.setAttribute('y', (size / 2).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-size', (size / 3).toString());
        text.textContent = count > 99 ? '99+' : count.toString();
        
        svg.appendChild(circle);
        svg.appendChild(text);
        
        const container = document.createElement('div');
        container.style.cursor = 'pointer';
        container.style.transform = 'translate(-50%, -50%)';
        container.appendChild(svg);
        
        return container;
      }
    }

    // Auto-fit map to show all search results
    if (shouldAutoFit && hasValidMarkers) {
      if (markersRef.current.length === 1) {
        // Center on single property with appropriate zoom
        const singleProperty = propertiesWithCoords[0];
        mapInstanceRef.current.setCenter({
          lat: Number(singleProperty.latitude),
          lng: Number(singleProperty.longitude)
        });
        mapInstanceRef.current.setZoom(15);
      } else if (markersRef.current.length > 1) {
        // Fit bounds to show all properties with padding
        const boundsWithPadding = new window.google.maps.LatLngBounds();
        
        // Add all property positions to bounds
        propertiesWithCoords.forEach(property => {
          boundsWithPadding.extend(new window.google.maps.LatLng(
            Number(property.latitude),
            Number(property.longitude)
          ));
        });
        
        // Apply bounds with padding for better visual spacing
        mapInstanceRef.current.fitBounds(boundsWithPadding, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        });
        
        // Set intelligent zoom limits based on number of properties
        const maxZoom = markersRef.current.length >= 20 ? 12 : 
                       markersRef.current.length >= 10 ? 13 : 
                       markersRef.current.length >= 5 ? 14 : 15;
        
        const minZoom = 8; // Prevent zooming out too far
        
        // Apply zoom limits after bounds are set
        const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
          const currentZoom = mapInstanceRef.current.getZoom();
          if (currentZoom > maxZoom) {
            mapInstanceRef.current.setZoom(maxZoom);
          } else if (currentZoom < minZoom) {
            mapInstanceRef.current.setZoom(minZoom);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    } else if (!shouldAutoFit && markersRef.current.length === 0) {
      // Reset to default center and zoom when no properties and auto-fit is disabled
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }

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
  }, [isMapReady, properties, selectedPropertyId, onPropertySelect, shouldCluster, shouldAutoFit, center, zoom]);

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

  const propertiesWithCoords = properties.filter(p => 
    p.latitude && p.longitude && 
    !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude)) &&
    Number(p.latitude) !== 0 && Number(p.longitude) !== 0
  );

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} style={{ height }} className="w-full" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <LoadingSpinner isVisible={true} message="Initializing map..." variant="inline" />
        </div>
      )}
      {isMapReady && propertiesWithCoords.length === 0 && properties.length > 0 && (
        <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded max-w-sm">
          <p className="text-sm font-medium">No properties with valid coordinates found.</p>
          <p className="text-xs mt-1">Properties need latitude and longitude values to display on the map. Coordinates are automatically generated when properties are created.</p>
          <p className="text-xs mt-2">
            <span className="font-medium">Tip:</span> If you have existing properties without coordinates, try refreshing the page or viewing the property details to trigger automatic geocoding.
          </p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    JSON.stringify(prevProps.properties) === JSON.stringify(nextProps.properties) &&
    prevProps.selectedPropertyId === nextProps.selectedPropertyId &&
    prevProps.height === nextProps.height &&
    JSON.stringify(prevProps.center) === JSON.stringify(nextProps.center) &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.enableClustering === nextProps.enableClustering &&
    prevProps.autoFit === nextProps.autoFit &&
    prevProps.onPropertySelect === nextProps.onPropertySelect
  );
});

export default PropertyMap;
