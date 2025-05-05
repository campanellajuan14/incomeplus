import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calculator as CalcIcon } from 'lucide-react';

const Calculator: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="section bg-gray-50">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Calculate your max affordable offer in seconds
          </h2>
          <p className="text-gray-600">
            Our calculator helps you determine the maximum price you can pay for a property while maintaining your desired cash flow and return targets.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="text"
                  defaultValue="350,000"
                  className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Down Payment %
                </label>
                <input
                  type="text"
                  defaultValue="20%"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate
                </label>
                <input
                  type="text"
                  defaultValue="5.75%"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term
                </label>
                <select className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>30 years</option>
                  <option>15 years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="text"
                    defaultValue="2,500"
                    className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button className="btn btn-primary w-full">
                Calculate Return
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-primary-500">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Monthly Payment</h3>
                <CalcIcon className="h-5 w-5 text-primary-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">$1,631</p>
              <p className="text-gray-500 text-sm mt-1">Principal and interest</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-accent-500">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Cash Flow</h3>
                <CalcIcon className="h-5 w-5 text-accent-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">$427</p>
              <p className="text-gray-500 text-sm mt-1">Monthly positive cash flow</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Cash-on-Cash Return</h3>
                <CalcIcon className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">7.3%</p>
              <p className="text-gray-500 text-sm mt-1">Annual return on investment</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;