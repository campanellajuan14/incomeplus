import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const PropertyAnalysis: React.FC = () => {
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
    <section id="property-analysis" className="section bg-white">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Accurate property analysis in just a few clicks
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-6">
              Import dozens of property data points
            </h3>
            <p className="text-gray-600 mb-6">
              Just enter a property address and IncomePlus pulls in critical data points such as purchase price, estimated rent, property taxes, HOA fees, and much more. See accurate cash flow immediately.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-10">
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm">Auto-import prices</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm">Property taxes</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm">Insurance estimates</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm">HOA fees</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-3"
          >
            <img
              src="https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Property"
              className="rounded-lg shadow-md col-span-2 row-span-2 object-cover h-full"
            />
            <img
              src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Property"
              className="rounded-lg shadow-md object-cover h-full"
            />
            <img
              src="https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Property"
              className="rounded-lg shadow-md object-cover h-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PropertyAnalysis;