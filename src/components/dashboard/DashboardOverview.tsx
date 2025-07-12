import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Heart, 
  DollarSign
} from 'lucide-react';
import { DashboardStats } from '../../types/dashboard';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    savedProperties: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    propertiesViewed: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return;

      try {
        // Fetch user's own properties count
        const { count: userPropertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch user's saved properties count
        const { count: savedPropertiesCount } = await supabase
          .from('saved_properties')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats({
          totalProperties: userPropertiesCount || 0,
          savedProperties: savedPropertiesCount || 0,
          totalIncome: 0,
          totalExpenses: 0,
          netIncome: 0,
          propertiesViewed: 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    prefix?: string;
  }> = ({ title, value, icon, color, prefix = '' }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="My Properties"
          value={stats.totalProperties}
          icon={<Eye size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Saved Properties"
          value={stats.savedProperties}
          icon={<Heart size={24} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Net Income"
          value={stats.netIncome}
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-purple-500"
          prefix="$"
        />
      </div>



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
    </div>
  );
};

export default DashboardOverview; 