import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock, BarChart2, DollarSign } from 'lucide-react';

const Benefits: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
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
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Analyze any investment property in seconds
          </h2>
          <a 
            href="#get-started" 
            className="btn btn-primary inline-block"
          >
            Get Started Free
          </a>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Accurate Analysis, Every Time</h3>
            <p className="text-gray-600">
              Our algorithms ensure the highest accuracy and comprehensive property analysis that real estate pros trust.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Designed for Speed</h3>
            <p className="text-gray-600">
              Get the data you need fast with automated imports, instant calculations, and intuitive property comparison tools.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Learning Curve</h3>
            <p className="text-gray-600">
              Intuitive design means you'll be creating detailed property analyses within minutes of signing up, not hours or days.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;