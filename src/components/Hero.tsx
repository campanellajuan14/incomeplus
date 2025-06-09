import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [borderLightPosition, setBorderLightPosition] = useState(0);

  // Set up the border light animation
  useEffect(() => {
    const animateBorderLight = () => {
      const duration = 4000; // 4 seconds for one full cycle
      const animate = () => {
        const timestamp = Date.now() % duration;
        const position = (timestamp / duration) * 100; // Convert to percentage
        setBorderLightPosition(position);
        requestAnimationFrame(animate);
      };
      
      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    };
    
    return animateBorderLight();
  }, []);

  // Function to handle the "Watch Demo" button click
  const handleWatchDemo = () => {
    setShowVideoModal(true);
  };

  // Close modal function
  const closeModal = () => {
    setShowVideoModal(false);
  };

  // Function to scroll to the PropertyAnalysis section
  const scrollToPropertyAnalysis = () => {
    const propertyAnalysisSection = document.querySelector('section[class*="section"]');
    
    if (propertyAnalysisSection) {
      propertyAnalysisSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 overflow-hidden">
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://assets.website-files.com/5e51c674258ffe10d286d30a/5e5354c0c791125ec04d1a55_peakmoney-grid.svg')] opacity-5"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/30 blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full bg-accent-400/40 blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-20 right-0 w-80 h-80 rounded-full bg-secondary-500/30 blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '12s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/15 transition-colors shadow-lg"
            >
              <span className="px-3 py-1 text-xs font-medium bg-secondary-500 text-white rounded-full shadow-inner">New</span>
              <span className="text-sm font-medium text-white ml-2">Trusted by 10,000+ property investors</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 leading-tight text-white"
            >
              Make <span className="relative inline-block">
                <span className="relative z-10 text-accent-300">smarter</span>
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-accent-400/50" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0,5 C50,15 150,0 200,5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span> real estate investments
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl mb-10 text-blue-50 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Our platform gives you the tools to analyze any investment property in seconds with accurate insights to maximize your returns.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Link 
                to="/auth" 
                className="btn px-8 py-4 bg-accent-400 hover:bg-accent-500 text-white rounded-full font-medium shadow-lg shadow-accent-500/20 flex items-center justify-center gap-2 group transition-all duration-300 hover:translate-y-[-2px]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button 
                className="btn px-8 py-4 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full font-medium flex items-center justify-center gap-2 group transition-all duration-300 hover:translate-y-[-2px]"
                onClick={handleWatchDemo}
                aria-label="Watch Demo Video"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s' }}></div>
                  <Play className="w-5 h-5 relative z-10" />
                </div>
                <span>Watch Demo</span>
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-xl mx-auto lg:mx-0"
            >
              {[
                { text: "Advanced ROI Analysis", subtext: "Complete cash flow reports" },
                { text: "Market Comparison", subtext: "Compare multiple properties" },
                { text: "Forecast Models", subtext: "Long-term projections" }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  className="flex flex-col items-center lg:items-start p-4 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (i * 0.1), duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 mr-2 text-accent-300 flex-shrink-0" />
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                  <p className="text-sm text-blue-100/70">{item.subtext}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10">
              <div className="absolute -inset-1 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary-400/40 via-accent-300/40 to-primary-300/40 opacity-70"></div>
                
                <div 
                  className="absolute h-20 w-40 bg-white blur-md rounded-full"
                  style={{
                    left: `${borderLightPosition}%`,
                    top: '0%',
                    transform: `translateX(-50%) rotate(${borderLightPosition * 3.6}deg)`,
                    opacity: 0.6,
                  }}
                ></div>
                
                <div 
                  className="absolute h-20 w-40 bg-white blur-md rounded-full"
                  style={{
                    left: `${(borderLightPosition + 50) % 100}%`,
                    bottom: '0%',
                    transform: `translateX(-50%) rotate(${borderLightPosition * 3.6}deg)`,
                    opacity: 0.6,
                  }}
                ></div>
                
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary-400/30 via-accent-300/30 to-primary-300/30 opacity-30 animate-pulse" style={{ animationDuration: '3s' }}></div>
              </div>
              
              <div className="relative z-10 bg-gradient-to-tr from-white/10 to-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
                <div className="aspect-[4/3] overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1800&q=80"
                    alt="Street view of multi-unit townhomes in a calm tree-lined neighborhood"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </div>
            
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-secondary-300/20 to-accent-300/20 rounded-full blur-3xl transform translate-x-10 translate-y-10 opacity-60"></div>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer group"
        onClick={scrollToPropertyAnalysis}
        role="button"
        aria-label="Scroll to property analysis section"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && scrollToPropertyAnalysis()}
      >
        <p className="text-white/80 text-sm mb-2 group-hover:text-white transition-colors">Discover More</p>
        <div className="w-10 h-14 rounded-full border-2 border-white/30 flex justify-center pt-2 backdrop-blur-sm group-hover:border-white/50 transition-colors">
          <motion.div
            animate={{ 
              y: [0, 8, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-white"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </motion.div>

      {showVideoModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={closeModal}
                className="bg-white/20 hover:bg-white/40 rounded-full p-2 text-white backdrop-blur-sm transition-all hover:rotate-90"
                aria-label="Close video"
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
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
