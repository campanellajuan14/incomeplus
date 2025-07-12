import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Heart, 
  BarChart3, 
  MessageSquare, 
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardTab, DashboardTabConfig } from '../types/dashboard';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import PropertyManagement from '../components/dashboard/PropertyManagement';
import SavedProperties from '../components/dashboard/SavedProperties';
import MessagingCenter from '../components/dashboard/MessagingCenter';
import ActivityHistory from '../components/dashboard/ActivityHistory';
import LoadingSpinner from '../components/LoadingSpinner';

const DASHBOARD_TABS: DashboardTabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'Home'
  },
  {
    id: 'properties',
    label: 'My Properties',
    icon: 'Home'
  },
  {
    id: 'saved',
    label: 'Saved Properties',
    icon: 'Heart'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'MessageSquare'
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'Activity'
  }
];

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      setIsLoading(false);
    }
  }, [loading, user]);

  const getTabIcon = (iconName: string) => {
    const iconProps = { size: 20, className: "mr-3" };
    switch (iconName) {
      case 'Home':
        return <Home {...iconProps} />;
      case 'Heart':
        return <Heart {...iconProps} />;
      case 'BarChart3':
        return <BarChart3 {...iconProps} />;
      case 'MessageSquare':
        return <MessageSquare {...iconProps} />;
      case 'Activity':
        return <Activity {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'properties':
        return <PropertyManagement />;
      case 'saved':
        return <SavedProperties />;
      case 'messages':
        return <MessagingCenter />;
      case 'activity':
        return <ActivityHistory />;
      default:
        return <DashboardOverview />;
    }
  };

  if (loading || isLoading) {
    return (
      <LoadingSpinner 
        isVisible={true}
        message="Loading your dashboard..."
        variant="overlay"
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="p-2">
                {DASHBOARD_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={tab.label}
                  >
                    {getTabIcon(tab.icon)}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {DASHBOARD_TABS.find(tab => tab.id === activeTab)?.label}
                    </h2>

                  </div>
                </div>
              </div>

              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 