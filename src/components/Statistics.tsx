import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Map, Building, Activity } from 'lucide-react';

const Statistics: React.FC = () => {
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
    <section className="section bg-white">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Quickly analyze a wide range of real estate investments
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md text-center"
          >
            <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-6 w-6 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Rental Properties</h3>
            <p className="text-gray-600 mb-4">
              Calculate cash flow and returns for single-family homes and small multi-family properties.
            </p>
            <p className="text-sm text-gray-500">Perfect for buy and hold investors</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md text-center"
          >
            <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-6 w-6 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Fix-&amp;-Flip Projects</h3>
            <p className="text-gray-600 mb-4">
              Estimate renovation costs, holding expenses, and potential profit margins for flips.
            </p>
            <p className="text-sm text-gray-500">Ideal for house flippers and rehabbers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-md text-center"
          >
            <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="h-6 w-6 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Commercial Properties</h3>
            <p className="text-gray-600 mb-4">
              Analyze offices, retail spaces, industrial properties, and multi-unit apartment buildings.
            </p>
            <p className="text-sm text-gray-500">Designed for commercial investors</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;