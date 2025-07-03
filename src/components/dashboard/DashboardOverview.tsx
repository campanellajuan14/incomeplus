import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageSquare, 
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DashboardStats } from '../../types/dashboard';
import { useAuth } from '../../context/AuthContext';

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    savedProperties: 0,
    activeInquiries: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    propertiesViewed: 0,
    searchesPerformed: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    // Simulating API call for now
    setTimeout(() => {
      setStats({
        totalProperties: 12,
        savedProperties: 8,
        activeInquiries: 3,
        totalIncome: 15600,
        totalExpenses: 8200,
        netIncome: 7400,
        propertiesViewed: 47,
        searchesPerformed: 23
      });
      setIsLoading(false);
    }, 1000);
  }, [user]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    prefix?: string;
  }> = ({ title, value, change, icon, color, prefix = '' }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm ml-1">{Math.abs(change)}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good afternoon!</h2>
        <p className="text-blue-100">
          Here's what's happening with your real estate portfolio today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          change={8.5}
          icon={<Eye size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Saved Properties"
          value={stats.savedProperties}
          change={12.3}
          icon={<Heart size={24} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Active Inquiries"
          value={stats.activeInquiries}
          change={-5.2}
          icon={<MessageSquare size={24} className="text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Net Income"
          value={stats.netIncome}
          change={15.8}
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-purple-500"
          prefix="$"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            ${stats.totalIncome.toLocaleString()}
          </div>
          <div className="flex items-center text-green-600">
            <TrendingUp size={16} />
            <span className="text-sm ml-1">12% increase</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expenses</h3>
          <div className="text-3xl font-bold text-red-600 mb-2">
            ${stats.totalExpenses.toLocaleString()}
          </div>
          <div className="flex items-center text-red-600">
            <TrendingUp size={16} />
            <span className="text-sm ml-1">3% increase</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${stats.netIncome.toLocaleString()}
          </div>
          <div className="flex items-center text-green-600">
            <TrendingUp size={16} />
            <span className="text-sm ml-1">18% increase</span>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Viewed property on Queen Street</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Saved search for downtown condos</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Received message from agent</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Updated property listing</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
          <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
            View all activity →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <Eye className="mx-auto mb-2 text-gray-400" size={24} />
                <span className="text-sm font-medium text-gray-700">Search Properties</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <Heart className="mx-auto mb-2 text-gray-400" size={24} />
                <span className="text-sm font-medium text-gray-700">View Saved</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-2 text-gray-400" size={24} />
                <span className="text-sm font-medium text-gray-700">Messages</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <div className="text-center">
                <Calendar className="mx-auto mb-2 text-gray-400" size={24} />
                <span className="text-sm font-medium text-gray-700">Schedule</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="text-yellow-600 mr-3" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                New properties matching your saved search "Downtown Condos"
              </p>
              <p className="text-xs text-yellow-600">3 new listings found</p>
            </div>
            <button className="text-yellow-700 text-sm font-medium hover:text-yellow-800">
              View
            </button>
          </div>
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <MessageSquare className="text-blue-600 mr-3" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                You have 2 unread messages from agents
              </p>
              <p className="text-xs text-blue-600">Response required</p>
            </div>
            <button className="text-blue-700 text-sm font-medium hover:text-blue-800">
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 