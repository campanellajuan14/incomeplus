
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Calculator, TrendingUp, FileSpreadsheet, PieChart, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: Calculator,
    title: "Advanced Property Calculator",
    description: "Calculate cash flow, cap rates, and ROI with precision using our comprehensive property analysis tools."
  },
  {
    icon: TrendingUp,
    title: "Market Analysis",
    description: "Get insights into local market trends and comparable property values to make informed investment decisions."
  },
  {
    icon: FileSpreadsheet,
    title: "Property Management",
    description: "Organize and track multiple properties in one centralized dashboard with detailed financial breakdowns."
  },
  {
    icon: PieChart,
    title: "Portfolio Analytics",
    description: "Visualize your portfolio performance with interactive charts and comprehensive reporting tools."
  },
  {
    icon: BarChart3,
    title: "Investment Tracking",
    description: "Monitor your investment performance over time and track key metrics that matter to your success."
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Evaluate potential risks and scenarios to make confident investment decisions with our analysis tools."
  }
];

const FeaturesGrid: React.FC = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div 
          ref={ref}
          className={`transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Property Analysis
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features designed to help you make informed real estate investment decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
