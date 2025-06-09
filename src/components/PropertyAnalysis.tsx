import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Info } from 'lucide-react';

const PropertyAnalysis: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <section ref={ref} className="section py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-primary-100 opacity-30 transform -skew-y-6"></div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto mb-20 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-800 leading-tight">
            Make <span className="text-primary-600">profitable decisions</span> with comprehensive insights
          </h2>
          <p className="text-lg text-gray-600 mt-6">
            Get detailed analytics about any property with our advanced tools
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3 shadow-sm">
                  <Info className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  One-click property insights
                </h3>
              </div>
              <p className="text-gray-600 mb-6 text-lg mt-6">
                Just enter an address and we'll instantly pull all critical data you need to make informed investment decisions.
              </p>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6"
                >
                  {[
                    'Property values',
                    'Rental estimates',
                    'Tax information',
                    'Insurance costs',
                    'Market trends',
                    'Local regulations',
                  ].map((item, index) => (
                    <div className="flex items-center gap-2" key={index}>
                      <div className="flex-shrink-0 h-5 w-5 rounded-full border border-primary-300 bg-primary-50 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-600" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-300 opacity-75"></div>
              
              <div className="relative z-10 bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <img
                  src="https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Property analysis dashboard"
                  className="w-full h-auto object-cover"
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
            </div>
            
            <div className="absolute grid grid-cols-2 gap-4 -right-5 -bottom-5 z-20">
              <div className="relative overflow-hidden rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105">
                <div className="relative overflow-hidden rounded-xl border-2 border-white ">
                  <img
                    src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=300"
                    alt="Property interior"
                    className="h-28 w-28 object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105">
                <div className="relative overflow-hidden rounded-xl border-2 border-white">
                  <img
                    src="https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=300"
                    alt="Property exterior"
                    className="h-28 w-28 object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PropertyAnalysis;
