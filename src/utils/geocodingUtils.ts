import { supabase } from '../integrations/supabase/client';

export interface Property {
  id: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const geocodePropertiesInBackground = async (properties: Property[]) => {
  // Find properties without coordinates
  const propertiesNeedingGeocode = properties.filter(property => 
    !property.latitude || !property.longitude ||
    property.latitude === 0 || property.longitude === 0
  );

  if (propertiesNeedingGeocode.length === 0) {
    return;
  }

  console.log(`Found ${propertiesNeedingGeocode.length} properties needing geocoding`);

  // Geocode properties one by one to avoid overwhelming the API
  for (const property of propertiesNeedingGeocode) {
    try {
      console.log(`Geocoding property: ${property.address}, ${property.city}`);
      
      const { data, error } = await supabase.functions.invoke('geocode-property', {
        body: {
          propertyId: property.id,
          address: property.address,
          city: property.city,
          province: property.province,
          postalCode: property.postal_code
        }
      });

      if (error) {
        console.error(`Failed to geocode property ${property.id}:`, error);
        continue;
      }

      if (data.error) {
        console.error(`Geocoding service error for property ${property.id}:`, data.error);
        continue;
      }

      console.log(`Successfully geocoded property ${property.id}`);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`Error geocoding property ${property.id}:`, err);
      continue;
    }
  }
}; 