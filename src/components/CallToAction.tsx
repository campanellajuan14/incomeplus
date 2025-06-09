
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Shield, Clock, BarChart } from 'lucide-react';

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

  const features = [
    { icon: <BarChart className="h-5 w-5" />, text: "Detailed analytics" },
    { icon: <Clock className="h-5 w-5" />, text: "14-day free trial" },
    { icon: <Shield className="h-5 w-5" />, text: "No credit card required" }
  ];

  return (
    <section id="get-started" className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 z-0"></div>
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=800')] bg-cover bg-center mix-blend-overlay"></div>
      
      <div className="container relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 shadow-xl border border-white/20"
        >
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Start analyzing investment properties like a pro
              </h2>
              <p className="text-xl text-blue-100">
                Join thousands of successful investors who make smart decisions with IncomePlus
              </p>
              
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-blue-50">
                    <div className="bg-white/20 rounded-full p-1">
                      {feature.icon}
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <h3 className="text-white text-xl font-semibold mb-2">Sign up for IncomePlus</h3>
                <p className="text-blue-100 mb-4">Get full access to all our analytics tools</p>
                
                <form className="space-y-4">
                  <div>
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <button className="btn bg-white text-primary-600 hover:bg-gray-100 transition-all w-full flex justify-center items-center gap-2 shadow-lg">
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-xs text-blue-100 mt-4 text-center">
                  By signing up, you agree to our Terms and Privacy Policy
                </p>
              </div>
              
              <div className="text-center">
                <button className="btn btn-secondary bg-transparent text-white border-white hover:bg-white/10 inline-flex items-center">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
