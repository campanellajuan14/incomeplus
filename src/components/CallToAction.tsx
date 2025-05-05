import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';

const CallToAction: React.FC = () => {
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
    <section id="get-started" className="section gradient-bg">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Start analyzing investment properties like a pro
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful investors who make smart decisions with IncomePlus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="btn bg-white text-primary-600 hover:bg-gray-100 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <button className="btn btn-secondary bg-transparent text-white border-white hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;