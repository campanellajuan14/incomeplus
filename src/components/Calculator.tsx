
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calculator as CalcIcon, DollarSign, Percent, CircleDollarSign } from 'lucide-react';

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
    <section className="section bg-gradient-to-b from-gray-50 to-white py-24">
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

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 lg:col-span-3 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-50 rounded-full filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2 z-0"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Property Details</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-gray-50 hover:bg-white transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment %
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-gray-50 hover:bg-white transition-colors duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-gray-400" />
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
                      className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-gray-50 hover:bg-white transition-colors duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term
                  </label>
                  <select 
                    value={loanTerm} 
                    onChange={(e) => setLoanTerm(e.target.value)}
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "1.5em 1.5em" }}
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
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-gray-50 hover:bg-white transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button className="btn btn-primary w-full py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <CalcIcon className="h-5 w-5" />
                  <span>Calculate Investment Returns</span>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl p-6 shadow-lg border border-primary-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100/50 rounded-full filter blur-2xl opacity-70 z-0"></div>
              
              <div className="flex justify-between items-center mb-3 relative z-10">
                <h3 className="text-lg font-semibold">Monthly Payment</h3>
                <div className="p-2.5 bg-white rounded-full shadow-md">
                  <CalcIcon className="h-5 w-5 text-primary-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">$1,631</p>
              <p className="text-gray-600 text-sm mb-3">Principal and interest</p>
              <div className="w-full bg-white/80 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-accent-50 rounded-2xl p-6 shadow-lg border border-accent-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-100/50 rounded-full filter blur-2xl opacity-70 z-0"></div>
              
              <div className="flex justify-between items-center mb-3 relative z-10">
                <h3 className="text-lg font-semibold">Cash Flow</h3>
                <div className="p-2.5 bg-white rounded-full shadow-md">
                  <CircleDollarSign className="h-5 w-5 text-accent-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">$427</p>
              <p className="text-gray-600 text-sm mb-3">Monthly positive cash flow</p>
              <div className="w-full bg-white/80 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-accent-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/50 rounded-full filter blur-2xl opacity-70 z-0"></div>
              
              <div className="flex justify-between items-center mb-3 relative z-10">
                <h3 className="text-lg font-semibold">Cash-on-Cash Return</h3>
                <div className="p-2.5 bg-white rounded-full shadow-md">
                  <Percent className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">7.3%</p>
              <p className="text-gray-600 text-sm mb-3">Annual return on investment</p>
              <div className="w-full bg-white/80 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
