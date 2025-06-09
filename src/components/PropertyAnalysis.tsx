
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, ChevronRight } from 'lucide-react';

const PropertyAnalysis: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="section py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-white"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-50 rounded-full opacity-70 blur-3xl -z-0"></div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto mb-20 text-center"
        >
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium bg-primary-50 rounded-full text-primary-700">
            Property Analysis
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            Make profitable decisions with comprehensive property insights
          </h2>
          <div className="w-24 h-1 bg-primary-500 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">
            Get detailed analytics about any property with our advanced tools
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-10"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Import property data with a single click
              </h3>
              <p className="text-gray-600 mb-6">
                Just enter an address and we'll automatically pull critical data points including purchase price, estimated rent, property taxes, insurance costs, and much more.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Property values', 
                  'Rental estimates', 
                  'Tax information', 
                  'Insurance costs',
                  'HOA details',
                  'Maintenance history',
                  'Market trends',
                  'Local regulations'
                ].map((item, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <div className="flex-shrink-0 h-5 w-5 bg-primary-50 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <a 
                href="#features" 
                className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                <span>Learn about all features</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-100">
              <img
                src="https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Property analysis dashboard"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Analysis Complete</h4>
                      <p className="text-sm text-gray-600">Property meets investment criteria</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded bg-gray-100">
                      <p className="text-xs text-gray-600">Cap Rate</p>
                      <p className="font-bold text-gray-900">7.2%</p>
                    </div>
                    <div className="p-2 rounded bg-gray-100">
                      <p className="text-xs text-gray-600">Cash Flow</p>
                      <p className="font-bold text-gray-900">$842/mo</p>
                    </div>
                    <div className="p-2 rounded bg-gray-100">
                      <p className="text-xs text-gray-600">ROI</p>
                      <p className="font-bold text-gray-900">14.8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute grid grid-cols-2 gap-3 -right-5 -bottom-5 z-20">
              <img
                src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Property interior"
                className="rounded-lg shadow-lg h-24 w-24 object-cover border-2 border-white"
              />
              <img
                src="https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Property exterior"
                className="rounded-lg shadow-lg h-24 w-24 object-cover border-2 border-white"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PropertyAnalysis;
