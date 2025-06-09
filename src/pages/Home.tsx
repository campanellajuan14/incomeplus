
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import FeatureSection from '../components/FeatureSection';
import PropertyAnalysis from '../components/PropertyAnalysis';
import FinancialAnalytics from '../components/FinancialAnalytics';
import Calculator from '../components/Calculator';
import Testimonials from '../components/Testimonials';
import Statistics from '../components/Statistics';
import Benefits from '../components/Benefits';

function Home() {
  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.main
      className="overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Hero />
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <PropertyAnalysis />
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <FeatureSection />
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <FinancialAnalytics />
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <Statistics />
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <Calculator />
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <Benefits />
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <Testimonials />
      </motion.div>
    </motion.main>
  );
}

export default Home;
