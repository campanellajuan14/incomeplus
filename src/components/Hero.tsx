
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, CheckCircle } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 z-0"></div>
      <div className="absolute inset-0 opacity-30 bg-[url('https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=800')] bg-cover bg-center mix-blend-overlay"></div>
      <div className="container relative z-10 pt-20 pb-24 md:pb-32 text-white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full text-white">
              Trusted by 10,000+ property investors
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Make smarter real estate investments with precise analytics.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-50">
              Analyze any investment property in seconds. Our software gives you accurate insights to know if a property will be profitable before you buy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#get-started"
                className="btn bg-white text-primary-600 hover:bg-gray-100 hover:text-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <button className="btn btn-secondary bg-transparent text-white border-white hover:bg-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
                  <path d="M8 5.14v14l11-7-11-7z"></path>
                </svg>
                Watch Demo
              </button>
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-accent-300" />
                <span className="text-blue-50">Advanced ROI and cash flow analysis</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-accent-300" />
                <span className="text-blue-50">Detailed property comparison</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-accent-300" />
                <span className="text-blue-50">Long-term projection forecasting</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -z-10 w-[200px] h-[200px] bg-primary-400/30 rounded-full blur-3xl top-10 -right-10"></div>
            <div className="relative z-10 drop-shadow-2xl">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                <img
                  src="https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Dashboard"
                  className="rounded-lg shadow-xl"
                />
              </div>
              <img
                src="https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Mobile App"
                className="absolute -bottom-10 -left-10 w-56 rounded-lg shadow-xl border-4 border-white/90"
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <button className="flex flex-col items-center text-sm font-medium">
          <span className="mb-1">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
