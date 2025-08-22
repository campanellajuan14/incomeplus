import React, { useState, useEffect } from 'react';
import { Eye, Heart, Search, MessageSquare, Upload, Edit3, Calendar, Filter, TrendingUp, BarChart3, MapPin, User, Clock, ArrowUpRight } from 'lucide-react';
import { UserActivity, ActivityType, ActivityFilter } from '../../types/dashboard';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../context/AuthContext';

const ActivityHistory: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [stats, setStats] = useState({
    propertiesViewed: 0,
    propertiesSaved: 0,
    searchesPerformed: 0,
    inquiriesSent: 0,
    propertiesUploaded: 0,
    messagesExchanged: 0
  });

  const getPeriodDate = (period: string) => {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  };

  const fetchActivities = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const periodDate = getPeriodDate(selectedPeriod);
      if (periodDate) {
        query = query.gte('created_at', periodDate);
      }

      if (filter.activity_type && filter.activity_type.length > 0) {
        query = query.in('activity_type', filter.activity_type);
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      setActivities((data || []).map(item => ({
        ...item,
        user_id: item.user_id || '',
        created_at: item.created_at || ''
      })));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const periodDate = getPeriodDate(selectedPeriod);
      let query = supabase
        .from('user_activity')
        .select('activity_type')
        .eq('user_id', user.id);

      if (periodDate) {
        query = query.gte('created_at', periodDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const activityCounts = (data || []).reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Also fetch saved properties count
      const { data: savedProps, error: savedError } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      // Fetch user's properties count
      const { data: userProps, error: propsError } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id);

      if (propsError) throw propsError;

      // Fetch unique agents contacted (Messages Sent should show unique agents contacted)
      let agentsContactedQuery = supabase
        .from('user_messages')
        .select('recipient_id')
        .eq('sender_id', user.id);

      if (periodDate) {
        agentsContactedQuery = agentsContactedQuery.gte('created_at', periodDate);
      }

      const { data: messagesData, error: messagesError } = await agentsContactedQuery;
      
      if (messagesError) throw messagesError;

      // Count unique agents contacted
      const uniqueAgentsContacted = new Set(messagesData?.map(msg => msg.recipient_id) || []).size;

      setStats({
        propertiesViewed: activityCounts['property_viewed'] || 0,
        propertiesSaved: savedProps?.length || 0,
        searchesPerformed: activityCounts['search_performed'] || 0,
        inquiriesSent: activityCounts['inquiry_sent'] || 0,
        propertiesUploaded: userProps?.length || 0,
        messagesExchanged: uniqueAgentsContacted
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setFilter({});
  };

  // Filter activity types
  const filterByType = (types?: ActivityType[]) => {
    setFilter({
      ...filter,
      activity_type: types && types.length > 0 ? types : undefined
    });
  };

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [user, filter, selectedPeriod]);

  const getActivityIcon = (type: ActivityType) => {
    const iconProps = { size: 16, className: "text-white" };
    switch (type) {
      case 'property_viewed':
        return <Eye {...iconProps} />;
      case 'property_saved':
        return <Heart {...iconProps} />;
      case 'search_performed':
        return <Search {...iconProps} />;
      case 'inquiry_sent':
        return <MessageSquare {...iconProps} />;
      case 'property_uploaded':
        return <Upload {...iconProps} />;
      case 'property_updated':
        return <Edit3 {...iconProps} />;
      case 'message_sent':
        return <MessageSquare {...iconProps} />;
      case 'profile_updated':
        return <User {...iconProps} />;
      default:
        return <Calendar {...iconProps} />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'property_viewed':
        return 'bg-blue-500';
      case 'property_saved':
        return 'bg-red-500';
      case 'search_performed':
        return 'bg-green-500';
      case 'inquiry_sent':
        return 'bg-yellow-500';
      case 'property_uploaded':
        return 'bg-purple-500';
      case 'property_updated':
        return 'bg-indigo-500';
      case 'message_sent':
        return 'bg-cyan-500';
      case 'profile_updated':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityDescription = (activity: UserActivity) => {
    switch (activity.activity_type as ActivityType) {
      case 'property_viewed':
        return `Viewed property: ${activity.activity_data?.property_title || 'Unknown Property'}`;
      case 'property_saved':
        return `Saved property: ${activity.activity_data?.property_title || 'Unknown Property'}`;
      case 'search_performed':
        return `Performed search in ${activity.activity_data?.location || 'unknown location'}`;
      case 'inquiry_sent':
        return `Sent inquiry about: ${activity.activity_data?.property_title || 'Unknown Property'}`;
      case 'property_uploaded':
        return `Uploaded new property: ${activity.activity_data?.property_title || 'Unknown Property'}`;
      case 'property_updated':
        return `Updated property: ${activity.activity_data?.property_title || 'Unknown Property'}`;
      case 'profile_updated':
        return 'Updated profile information';
      case 'message_sent':
        return `Sent message to ${activity.activity_data?.recipient || 'agent'}`;
      default:
        return 'Unknown activity';
    }
  };

  const ActivityItem: React.FC<{ activity: UserActivity }> = ({ activity }) => {
    const timeAgo = (date: string) => {
      const now = new Date();
      const activityDate = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return activityDate.toLocaleDateString();
    };

    return (
      <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 hover:border-gray-300">
        <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type as ActivityType)} flex-shrink-0`}>
          {getActivityIcon(activity.activity_type as ActivityType)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium leading-5">
            {getActivityDescription(activity)}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-gray-500">
              <Clock size={12} className="mr-1" />
              <span>{timeAgo(activity.created_at)}</span>
            </div>
            {activity.activity_data?.location && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin size={12} className="mr-1" />
                <span className="truncate max-w-24">{activity.activity_data.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ 
    title, 
    value, 
    icon, 
    color 
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-16 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Activity History</h2>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period === 'all' ? 'All Time' : period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Properties Viewed"
          value={stats.propertiesViewed}
          icon={<Eye size={20} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Properties Saved"
          value={stats.propertiesSaved}
          icon={<Heart size={20} className="text-white" />}
          color="bg-red-500"
        />
        <StatCard
          title="Searches Performed"
          value={stats.searchesPerformed}
          icon={<Search size={20} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Inquiries Sent"
          value={stats.inquiriesSent}
          icon={<MessageSquare size={20} className="text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Properties Listed"
          value={stats.propertiesUploaded}
          icon={<Upload size={20} className="text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Agents Contacted"
          value={stats.messagesExchanged}
          icon={<MessageSquare size={20} className="text-white" />}
          color="bg-cyan-500"
        />
      </div>

      {/* Activity Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-start space-x-4">
          <Filter size={20} className="text-gray-400 mt-1" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filter Activities</h3>
            <div className="flex flex-wrap gap-2">
              {(['property_viewed', 'property_saved', 'search_performed', 'inquiry_sent', 'property_uploaded', 'message_sent'] as ActivityType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    const currentTypes = filter.activity_type || [];
                    const newTypes = currentTypes.includes(type)
                      ? currentTypes.filter(t => t !== type)
                      : [...currentTypes, type];
                    filterByType(newTypes.length > 0 ? newTypes : undefined);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 flex items-center space-x-1 ${
                    filter.activity_type?.includes(type)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-1 ${getActivityColor(type)}`}></div>
                  <span>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </button>
              ))}
            </div>
            {filter.activity_type && filter.activity_type.length > 0 && (
              <button
                onClick={() => resetFilters()}
                className="text-xs text-blue-600 hover:text-blue-800 mt-2 flex items-center"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar size={32} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
            <p className="text-gray-600">
              Your activity will appear here as you interact with properties and features.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Activity Insights */}
      {activities.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-600" />
              Activity Insights
            </h3>
            <div className="text-sm text-gray-600">
              Last {selectedPeriod === 'all' ? 'All time' : selectedPeriod}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <BarChart3 size={16} className="mr-2" />
                Most Popular Actions
              </h4>
              <div className="space-y-2">
                {Object.entries({
                  'Property Views': stats.propertiesViewed,
                  'Searches': stats.searchesPerformed,
                  'Properties Saved': stats.propertiesSaved,
                }).sort(([,a], [,b]) => b - a).slice(0, 3).map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{action}</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">{count}</span>
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(10, (count / Math.max(...Object.values({
                            'Property Views': stats.propertiesViewed,
                            'Searches': stats.searchesPerformed,
                            'Properties Saved': stats.propertiesSaved,
                          }))) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar size={16} className="mr-2" />
                Recent Activity
              </h4>
              <div className="space-y-2">
                {activities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="text-sm">
                    <div className="flex items-center text-gray-600">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getActivityColor(activity.activity_type as ActivityType)}`}></div>
                      <span className="truncate">
                        {activity.activity_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <ArrowUpRight size={16} className="mr-2" />
                Quick Stats
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Activities</span>
                  <span className="font-medium">{activities.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Properties Listed</span>
                  <span className="font-medium">{stats.propertiesUploaded}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg. Daily Activity</span>
                  <span className="font-medium">
                    {selectedPeriod === 'all' ? '—' : Math.round(activities.length / (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90) * 10) / 10}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory; 