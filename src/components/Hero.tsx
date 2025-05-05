import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700 z-0"></div>
      <div className="container relative z-10 pt-20 pb-24 md:pb-32 text-white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Analyze any investment property in seconds.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-50">
              Our software makes it easy to analyze rental property potential. Know if a home makes sense financially before you buy, with accurate, in-depth analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#get-started"
                className="btn bg-white text-primary-600 hover:bg-gray-100 hover:text-primary-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <button className="btn btn-secondary bg-transparent text-white border-white hover:bg-white/10">
                Watch Demo
              </button>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                <img
                  src="https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <img
                  src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <img
                  src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              </div>
              <span className="ml-4 text-sm text-blue-50">
                Trusted by <span className="font-semibold">10,000+</span> investors and agents
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 drop-shadow-2xl">
              <img
                src="https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Dashboard"
                className="rounded-lg"
              />
              <img
                src="https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Mobile App"
                className="absolute -bottom-10 -left-10 w-56 rounded-lg shadow-xl border-4 border-white"
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white">
        <button className="flex flex-col items-center text-sm font-medium">
          <span className="mb-1">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
};

export default Hero;