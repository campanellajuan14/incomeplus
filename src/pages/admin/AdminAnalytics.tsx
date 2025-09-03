import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building, 
  DollarSign,
  Calendar,
  Activity,
  PieChart
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  totalProperties: number;
  newUsersThisMonth: number;
  newPropertiesThisMonth: number;
  userGrowthRate: number;
  propertyGrowthRate: number;
  avgPropertyValue: number;
  totalPropertyValue: number;
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProperties: 0,
    newUsersThisMonth: 0,
    newPropertiesThisMonth: 0,
    userGrowthRate: 0,
    propertyGrowthRate: 0,
    avgPropertyValue: 0,
    totalPropertyValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch user data
      const { data: users } = await supabase
        .from('user_profiles')
        .select('created_at, account_status');

      // Fetch property data
      const { data: properties } = await supabase
        .from('properties')
        .select('created_at, purchase_price, approval_status');

      if (users && properties) {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

        // Calculate user metrics
        const activeUsers = users.filter(u => u.account_status === 'active').length;
        const newUsersThisMonth = users.filter(u => 
          u.created_at && new Date(u.created_at) > lastMonth
        ).length;
        const newUsersLastMonth = users.filter(u => 
          u.created_at && new Date(u.created_at) > twoMonthsAgo && new Date(u.created_at) <= lastMonth
        ).length;

        // Calculate property metrics
        const totalProperties = properties.length;
        const approvedProperties = properties.filter(p => p.approval_status === 'approved');
        const newPropertiesThisMonth = properties.filter(p => 
          p.created_at && new Date(p.created_at) > lastMonth
        ).length;
        const newPropertiesLastMonth = properties.filter(p => 
          p.created_at && new Date(p.created_at) > twoMonthsAgo && new Date(p.created_at) <= lastMonth
        ).length;

        // Calculate financial metrics
        const propertiesWithPrice = approvedProperties.filter(p => p.purchase_price && p.purchase_price > 0);
        const totalPropertyValue = propertiesWithPrice.reduce((sum, p) => sum + (p.purchase_price || 0), 0);
        const avgPropertyValue = propertiesWithPrice.length > 0 ? totalPropertyValue / propertiesWithPrice.length : 0;

        // Calculate growth rates
        const userGrowthRate = newUsersLastMonth > 0 
          ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
          : newUsersThisMonth > 0 ? 100 : 0;

        const propertyGrowthRate = newPropertiesLastMonth > 0 
          ? ((newPropertiesThisMonth - newPropertiesLastMonth) / newPropertiesLastMonth) * 100 
          : newPropertiesThisMonth > 0 ? 100 : 0;

        setAnalytics({
          totalUsers: activeUsers,
          totalProperties,
          newUsersThisMonth,
          newPropertiesThisMonth,
          userGrowthRate,
          propertyGrowthRate,
          avgPropertyValue,
          totalPropertyValue
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor platform performance and growth</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className={`h-4 w-4 mr-1 ${analytics.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${analytics.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.userGrowthRate)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalProperties.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className={`h-4 w-4 mr-1 ${analytics.propertyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${analytics.propertyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.propertyGrowthRate)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Property Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.avgPropertyValue)}</p>
              <div className="flex items-center mt-2">
                <Activity className="h-4 w-4 mr-1 text-purple-600" />
                <span className="text-sm text-gray-500">Market average</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalPropertyValue)}</p>
              <div className="flex items-center mt-2">
                <PieChart className="h-4 w-4 mr-1 text-orange-600" />
                <span className="text-sm text-gray-500">Combined value</span>
              </div>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Growth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">New Users This Month</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">{analytics.newUsersThisMonth}</div>
            <div className="ml-4">
              <div className="flex items-center">
                <TrendingUp className={`h-4 w-4 mr-1 ${analytics.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${analytics.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.userGrowthRate)}
                </span>
              </div>
              <p className="text-sm text-gray-500">Growth rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">New Properties This Month</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-green-600">{analytics.newPropertiesThisMonth}</div>
            <div className="ml-4">
              <div className="flex items-center">
                <TrendingUp className={`h-4 w-4 mr-1 ${analytics.propertyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${analytics.propertyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.propertyGrowthRate)}
                </span>
              </div>
              <p className="text-sm text-gray-500">Growth rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{analytics.totalUsers}</div>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{analytics.totalProperties}</div>
            <p className="text-sm text-gray-600">Listed Properties</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {formatCurrency(analytics.avgPropertyValue)}
            </div>
            <p className="text-sm text-gray-600">Average Property Value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;