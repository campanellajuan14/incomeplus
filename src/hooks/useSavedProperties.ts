import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';

export const useSavedProperties = () => {
  const { user } = useAuth();
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved properties for the current user
  const fetchSavedProperties = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching saved properties:', error);
        return;
      }

      const savedIds = new Set(data?.map(item => item.property_id).filter((id): id is string => id !== null) || []);
      setSavedPropertyIds(savedIds);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save a property
  const saveProperty = async (propertyId: string, notes?: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('saved_properties')
        .insert({
          user_id: user.id,
          property_id: propertyId,
          notes: notes || null
        });

      if (error) {
        console.error('Error saving property:', error);
        return { success: false, error: error.message };
      }

      setSavedPropertyIds(prev => new Set([...prev, propertyId]));
      return { success: true };
    } catch (error) {
      console.error('Error saving property:', error);
      return { success: false, error: 'Failed to save property' };
    }
  };

  // Unsave a property
  const unsaveProperty = async (propertyId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) {
        console.error('Error unsaving property:', error);
        return { success: false, error: error.message };
      }

      setSavedPropertyIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      return { success: true };
    } catch (error) {
      console.error('Error unsaving property:', error);
      return { success: false, error: 'Failed to unsave property' };
    }
  };

  // Toggle saved status
  const toggleSaved = async (propertyId: string) => {
    if (savedPropertyIds.has(propertyId)) {
      return await unsaveProperty(propertyId);
    } else {
      return await saveProperty(propertyId);
    }
  };

  // Check if a property is saved
  const isSaved = (propertyId: string) => savedPropertyIds.has(propertyId);

  useEffect(() => {
    fetchSavedProperties();
  }, [user]);

  return {
    savedPropertyIds,
    isLoading,
    saveProperty,
    unsaveProperty,
    toggleSaved,
    isSaved,
    refetch: fetchSavedProperties
  };
}; 