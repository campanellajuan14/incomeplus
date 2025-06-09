
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calculator as CalcIcon, DollarSign, TrendingUp, BarChart } from 'lucide-react';

const Calculator: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [purchasePrice, setPurchasePrice] = useState('350,000');
  const [downPayment, setDownPayment] = useState('20');
  const [interestRate, setInterestRate] = useState('5.75');
  const [loanTerm, setLoanTerm] = useState('30');
  const [monthlyRent, setMonthlyRent] = useState('2,500');

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
    <section className="section bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary-100 rounded-full text-primary-700">
            Investment Calculator
          </span>
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
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Down Payment %
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term
                </label>
                <select 
                  value={loanTerm} 
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-white"
                >
                  <option value="30">30 years</option>
                  <option value="15">15 years</option>
                  <option value="10">10 years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button className="btn btn-primary w-full shadow-md hover:shadow-lg transition-all">
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
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-primary-500 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Monthly Payment</h3>
                <div className="p-2 bg-primary-50 rounded-full">
                  <CalcIcon className="h-5 w-5 text-primary-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">$1,631</p>
              <p className="text-gray-500 text-sm mt-1">Principal and interest</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3">
                <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-accent-500 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Cash Flow</h3>
                <div className="p-2 bg-accent-50 rounded-full">
                  <TrendingUp className="h-5 w-5 text-accent-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">$427</p>
              <p className="text-gray-500 text-sm mt-1">Monthly positive cash flow</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3">
                <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Cash-on-Cash Return</h3>
                <div className="p-2 bg-green-50 rounded-full">
                  <BarChart className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">7.3%</p>
              <p className="text-gray-500 text-sm mt-1">Annual return on investment</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
