import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { PieChart, DollarSign, TrendingUp } from 'lucide-react';

const FinancialAnalytics: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} id="financial-analytics" className="section py-24 bg-white relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            Fine-tune your investment strategy with precise financial tools
          </h2>
          <p className="text-lg text-gray-600">
            Customize all your investment assumptions for complete control over your analysis and find the perfect balance of risk and reward
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <div className="relative order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative z-10 bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-100"
            >
              <img
                src="https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Financial Dashboard"
                className="w-full h-auto"
              />
              
              <div className="absolute top-6 left-6 p-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg max-w-[200px]">
                <h4 className="font-semibold text-sm mb-2 text-gray-800">Monthly Cash Flow</h4>
                <div className="h-2 w-full bg-gray-200 rounded-full mb-1">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">$0</span>
                  <span className="text-gray-800 font-medium">$842</span>
                  <span className="text-gray-600">$1200</span>
                </div>
              </div>
              
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Annual ROI</p>
                    <p className="font-bold text-gray-900">14.8%</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="absolute bottom-8 -left-8 p-4 bg-white rounded-lg shadow-xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-accent-100 rounded-full flex items-center justify-center text-accent-600">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Cash on Cash</p>
                  <p className="text-lg font-bold text-gray-900">12.4%</p>
                </div>
              </div>
            </motion.div>
            
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-100/50 to-secondary-100/50 blur-3xl rounded-full transform scale-110 -translate-y-10"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-10 order-1 lg:order-2"
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="bg-primary-50 p-3 rounded-full inline-block">
                    <PieChart className="h-6 w-6 text-primary-600" />
                  </div>
                Comprehensive Financial Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get detailed metrics including cash flow, cap rate, ROI, cash-on-cash return, and internal rate of return. Understand your investment's potential from every angle.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="bg-primary-50 p-3 rounded-full inline-block">
                    <DollarSign className="h-6 w-6 text-primary-600" />
                  </div>
                  Intelligent Expense Forecasting</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI-powered algorithms accurately forecast all property expenses including maintenance, insurance, property taxes, HOA fees, and more. Plan for all potential costs.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="bg-primary-50 p-3 rounded-full inline-block">
                    <TrendingUp className="h-6 w-6 text-primary-600" />
                  </div>
                  Smart Long-term Projections
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  See how your investment performs over time with year-by-year projections. Account for appreciation, inflation, and rent increases with adjustable parameters.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinancialAnalytics;
