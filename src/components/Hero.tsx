
import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Hero = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Function to handle the "Watch Demo" button click
  const handleWatchDemo = () => {
    setShowVideoModal(true);
  };

  // Close modal function
  const closeModal = () => {
    setShowVideoModal(false);
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-600 to-primary-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/30 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-secondary-400/40 blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-80 h-80 rounded-full bg-accent-400/30 blur-3xl"></div>
      </div>

      <div className="container relative z-10 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="px-3 py-1 text-xs font-medium bg-white/20 rounded-full">New</span>
              <span className="text-sm font-medium text-white ml-2">Trusted by 10,000+ property investors</span>
            </motion.span>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl xl:text-6xl font-bold mb-8 leading-tight text-white"
            >
              Make <span className="text-accent-300">smarter</span> real estate investments with precise analytics
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl mb-10 text-blue-100 max-w-xl mx-auto lg:mx-0"
            >
              Our platform gives you the tools to analyze any investment property in seconds with accurate insights to maximize your returns.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Link to="/auth" className="btn bg-white text-primary-600 hover:bg-white/90 shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2 group">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2"
                onClick={handleWatchDemo}
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-6 max-w-xl mx-auto lg:mx-0"
            >
              {[
                { text: "Advanced ROI Analysis", subtext: "Complete cash flow reports" },
                { text: "Market Comparison", subtext: "Compare multiple properties" },
                { text: "Forecast Models", subtext: "Long-term projections" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 mr-2 text-accent-300" />
                    <span className="text-blue-50 font-medium whitespace-nowrap">{item.text}</span>
                  </div>
                  <p className="text-sm text-blue-100/70">{item.subtext}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 bg-gradient-to-tr from-white/10 to-white/20 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/20">
              <div className="aspect-[4/3] overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1800&q=80"
                  alt="Street view of multi-unit townhomes in a calm tree-lined neighborhood"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute -bottom-8 -left-12 p-4 bg-white rounded-lg shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                  24%
                </div>
                <div>
                  <p className="text-sm font-medium">ROI Increase</p>
                  <p className="text-xs text-gray-500">Year over Year</p>
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/4 -right-8 p-3 bg-white rounded-lg shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Market trending up</span>
              </div>
            </div>
            
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-secondary-300/20 to-accent-300/20 rounded-full blur-3xl transform translate-x-10 translate-y-10 opacity-60"></div>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={closeModal}
                className="bg-white/20 hover:bg-white/40 rounded-full p-2 text-white backdrop-blur-sm transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Property Investment Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
