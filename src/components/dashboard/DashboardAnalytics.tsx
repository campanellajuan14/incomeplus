import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, PieChart, Calendar } from 'lucide-react';
import { FinancialMetrics, PropertyPerformance, ChartData } from '../../types/dashboard';

const DashboardAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netCashFlow: 0,
    totalROI: 0,
    occupancyRate: 0,
    averageRent: 0
  });
  const [propertyPerformance, setPropertyPerformance] = useState<PropertyPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setMetrics({
        monthlyIncome: 8500,
        monthlyExpenses: 3200,
        netCashFlow: 5300,
        totalROI: 12.5,
        occupancyRate: 94.2,
        averageRent: 2125
      });
      setPropertyPerformance([
        // Mock data - replace with actual API calls
      ]);
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    prefix?: string;
    suffix?: string;
  }> = ({ title, value, change, icon, color, prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={16} className={change < 0 ? 'rotate-180' : ''} />
              <span className="text-sm ml-1">{Math.abs(change)}% from last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const SimpleBarChart: React.FC<{ data: number[]; labels: string[]; title: string }> = ({ 
    data, 
    labels, 
    title 
  }) => {
    const maxValue = Math.max(...data);
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((value, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm text-gray-600">{labels[index]}</div>
              <div className="flex-1 mx-3">
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(value / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-sm font-medium text-gray-900 text-right">
                ${value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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

  const incomeData = [15600, 14800, 16200, 15900, 17100, 16500];
  const expenseData = [8200, 7900, 8500, 8100, 8700, 8300];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Analytics</h2>
        <div className="flex space-x-2">
          {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Monthly Income"
          value={metrics.monthlyIncome}
          change={8.2}
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-green-500"
          prefix="$"
        />
        <MetricCard
          title="Monthly Expenses"
          value={metrics.monthlyExpenses}
          change={-2.1}
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-red-500"
          prefix="$"
        />
        <MetricCard
          title="Net Cash Flow"
          value={metrics.netCashFlow}
          change={12.4}
          icon={<BarChart3 size={24} className="text-white" />}
          color="bg-blue-500"
          prefix="$"
        />
        <MetricCard
          title="Total ROI"
          value={metrics.totalROI}
          change={1.8}
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-purple-500"
          suffix="%"
        />
        <MetricCard
          title="Occupancy Rate"
          value={metrics.occupancyRate}
          change={2.3}
          icon={<PieChart size={24} className="text-white" />}
          color="bg-indigo-500"
          suffix="%"
        />
        <MetricCard
          title="Average Rent"
          value={metrics.averageRent}
          change={4.1}
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-teal-500"
          prefix="$"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={incomeData}
          labels={monthLabels}
          title="Monthly Income Trend"
        />
        <SimpleBarChart
          data={expenseData}
          labels={monthLabels}
          title="Monthly Expenses Trend"
        />
      </div>

      {/* Property Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
        </div>
        <div className="overflow-x-auto">
          {propertyPerformance.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart3 size={32} className="text-gray-400" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Property Data</h4>
              <p className="text-gray-600">
                Add properties and track income/expenses to see performance analytics.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Cash Flow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {propertyPerformance.map((property) => (
                  <tr key={property.property_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {property.property_title}
                        </div>
                        <div className="text-sm text-gray-500">{property.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${property.monthly_income.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${property.monthly_expenses.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        property.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${property.net_cash_flow.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        property.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {property.roi_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${property.occupancy_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {property.occupancy_rate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              ${metrics.netCashFlow.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Net Cash Flow</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {metrics.totalROI.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Average Portfolio ROI</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {metrics.occupancyRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Overall Occupancy Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics; 