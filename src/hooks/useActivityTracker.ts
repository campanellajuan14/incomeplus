import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { ActivityType } from '../types/dashboard';

interface ActivityData {
  property_id?: string;
  property_title?: string;
  location?: string;
  search_query?: string;
  recipient?: string;
  amount?: number;
  [key: string]: any;
}

export const useActivityTracker = () => {
  const { user } = useAuth();

  const trackActivity = async (activityType: ActivityType, data?: ActivityData) => {
    if (!user) return;

    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: data || {}
        });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  return { trackActivity };
};