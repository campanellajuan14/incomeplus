import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  BarChart3, 
  MessageSquare, 
  Activity, 
  Settings,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardTab, DashboardTabConfig } from '../types/dashboard';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import PropertyManagement from '../components/dashboard/PropertyManagement';
import SavedProperties from '../components/dashboard/SavedProperties';
import DashboardAnalytics from '../components/dashboard/DashboardAnalytics';
import MessagingCenter from '../components/dashboard/MessagingCenter';
import ActivityHistory from '../components/dashboard/ActivityHistory';
import DashboardSettings from '../components/dashboard/DashboardSettings';
import LoadingSpinner from '../components/LoadingSpinner';

const DASHBOARD_TABS: DashboardTabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'Home',
    description: 'Dashboard overview and key metrics'
  },
  {
    id: 'properties',
    label: 'My Properties',
    icon: 'Home',
    description: 'Manage your property listings and investments'
  },
  {
    id: 'saved',
    label: 'Saved Properties',
    icon: 'Heart',
    description: 'Properties you have saved and search alerts'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'BarChart3',
    description: 'Financial analytics and performance insights'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'MessageSquare',
    description: 'Communicate with agents and property managers'
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'Activity',
    description: 'Your activity history and platform interactions'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    description: 'Profile and notification settings'
  }
];

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
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
      case 'Settings':
        return <Settings {...iconProps} />;
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
      case 'analytics':
        return <DashboardAnalytics />;
      case 'messages':
        return <MessagingCenter />;
      case 'activity':
        return <ActivityHistory />;
      case 'settings':
        return <DashboardSettings />;
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
        <div className="mb-8">
          <div className="flex items-center justify-end">
            <div className="flex space-x-4">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Search className="mr-2" size={16} />
                Search Properties
              </button>
              <button 
                onClick={() => navigate('/properties/upload')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Add Property
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
              </div>
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
                    title={tab.description}
                  >
                    {getTabIcon(tab.icon)}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Properties</span>
                  <span className="font-semibold text-blue-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saved Properties</span>
                  <span className="font-semibold text-green-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Inquiries</span>
                  <span className="font-semibold text-orange-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Unread Messages</span>
                  <span className="font-semibold text-red-600">2</span>
                </div>
              </div>
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
                    <p className="text-gray-600 mt-1">
                      {DASHBOARD_TABS.find(tab => tab.id === activeTab)?.description}
                    </p>
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