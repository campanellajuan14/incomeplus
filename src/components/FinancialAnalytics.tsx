import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { PieChart, DollarSign, TrendingUp } from 'lucide-react';

const FinancialAnalytics: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="financial-analytics" className="section bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Customizable analysis and parameters
          </h2>
          <p className="text-gray-600">
            Edit all of your investment assumptions for complete control over your analysis. Find the perfect balance of risk and reward.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <img
                src="https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Financial Dashboard"
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-8">
            <div className="space-y-4">
              <div className="bg-primary-50 p-3 rounded-full inline-block">
                <PieChart className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-2xl font-semibold">Comprehensive Financial Metrics</h3>
              <p className="text-gray-600">
                Get detailed financial metrics including cash flow, cap rate, ROI, and cash-on-cash return. Understand your investment's potential from every angle.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary-50 p-3 rounded-full inline-block">
                <DollarSign className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-2xl font-semibold">Expense Forecasting</h3>
              <p className="text-gray-600">
                Accurately forecast all property expenses including maintenance, insurance, property taxes, HOA fees, and more. Plan for all potential costs.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary-50 p-3 rounded-full inline-block">
                <TrendingUp className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-2xl font-semibold">Long-term Projections</h3>
              <p className="text-gray-600">
                See how your investment performs over time with year-by-year projections. Account for appreciation, inflation, and rent increases.
              </p>
            </div>

            <button className="btn btn-primary mt-4">
              Try Our Analysis Tools
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinancialAnalytics;