import React, { useState, useEffect } from 'react';
import { Eye, Heart, Search, MessageSquare, Upload, Edit3, Calendar, Filter } from 'lucide-react';
import { UserActivity, ActivityType, ActivityFilter } from '../../types/dashboard';

const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setActivities([
        // Mock data - replace with actual API calls
      ]);
      setIsLoading(false);
    }, 1000);
  }, [filter, selectedPeriod]);

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

  const ActivityItem: React.FC<{ activity: UserActivity }> = ({ activity }) => (
    <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type as ActivityType)}`}>
        {getActivityIcon(activity.activity_type as ActivityType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium">
          {getActivityDescription(activity)}
        </p>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Calendar size={12} className="mr-1" />
          <span>{new Date(activity.created_at).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

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

  // Mock statistics - replace with actual data
  const stats = {
    propertiesViewed: 47,
    propertiesSaved: 8
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Properties Viewed"
          value={stats.propertiesViewed}
          icon={<Eye size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Properties Saved"
          value={stats.propertiesSaved}
          icon={<Heart size={24} className="text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Activity Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {(['property_viewed', 'property_saved'] as ActivityType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  const currentTypes = filter.activity_type || [];
                  const newTypes = currentTypes.includes(type)
                    ? currentTypes.filter(t => t !== type)
                    : [...currentTypes, type];
                  setFilter({ ...filter, activity_type: newTypes.length > 0 ? newTypes : undefined });
                }}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter.activity_type?.includes(type)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
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

      {/* Activity Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Most Active Days</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monday</span>
                <span className="font-medium">15 activities</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Wednesday</span>
                <span className="font-medium">12 activities</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Friday</span>
                <span className="font-medium">10 activities</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Activities</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Property Views</span>
                <span className="font-medium">47 times</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Searches</span>
                <span className="font-medium">23 times</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Properties Saved</span>
                <span className="font-medium">8 times</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory; 