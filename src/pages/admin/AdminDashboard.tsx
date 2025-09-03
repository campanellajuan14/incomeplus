import React, { useState, useEffect } from 'react';
import { Users, Home, Shield, CheckCircle, XCircle, Settings } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface Property {
  id: string;
  property_title: string;
  address: string;
  city: string;
  province: string;
  user_id: string;
  approval_status: string | null;
  status: string | null;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingApproval: 0,
    approvedProperties: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error in fetchProperties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('approval_status, status');
      
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id');

      const totalProperties = propertiesData?.length || 0;
      const pendingApproval = propertiesData?.filter(p => p.approval_status === 'pending').length || 0;
      const approvedProperties = propertiesData?.filter(p => p.approval_status === 'approved').length || 0;
      const totalUsers = usersData?.length || 0;

      setStats({
        totalProperties,
        pendingApproval,
        approvedProperties,
        totalUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const approveProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          approval_status: 'approved',
          status: 'active'
        })
        .eq('id', propertyId);

      if (error) {
        console.error('Error approving property:', error);
        alert('Error approving property');
      } else {
        alert('Property approved successfully');
        fetchProperties();
        fetchStats();
      }
    } catch (error) {
      console.error('Error in approveProperty:', error);
    }
  };

  const rejectProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          approval_status: 'rejected',
          status: 'inactive'
        })
        .eq('id', propertyId);

      if (error) {
        console.error('Error rejecting property:', error);
        alert('Error rejecting property');
      } else {
        alert('Property rejected');
        fetchProperties();
        fetchStats();
      }
    } catch (error) {
      console.error('Error in rejectProperty:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApproval}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedProperties}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Properties</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.property_title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.city}, {property.province}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        property.approval_status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : property.approval_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {property.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {property.approval_status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveProperty(property.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectProperty(property.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;