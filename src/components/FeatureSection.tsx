
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BarChart3, 
  Banknote, 
  Calculator, 
  Building, 
  LineChart, 
  ArrowUpRight 
} from 'lucide-react';

const features = [
  {
    icon: <BarChart3 className="h-8 w-8 text-primary-500" />,
    title: 'Instant ROI Analysis',
    description: 'Get immediate insights into cash flow, ROI, cap rate, and cash-on-cash return for any property.',
  },
  {
    icon: <Banknote className="h-8 w-8 text-primary-500" />,
    title: 'Cash Flow Projections',
    description: 'See monthly and annual cash flow projections with detailed breakdowns of income and expenses.',
  },
  {
    icon: <Calculator className="h-8 w-8 text-primary-500" />,
    title: 'Mortgage Calculator',
    description: 'Calculate mortgage payments with various loan terms, interest rates, and down payment options.',
  },
  {
    icon: <Building className="h-8 w-8 text-primary-500" />,
    title: 'Property Comparison',
    description: 'Compare multiple properties side-by-side to make data-driven investment decisions.',
  },
  {
    icon: <LineChart className="h-8 w-8 text-primary-500" />,
    title: 'Long-term Analysis',
    description: 'Forecast property performance over 5, 10, or 30 years with appreciation and inflation factors.',
  },
  {
    icon: <ArrowUpRight className="h-8 w-8 text-primary-500" />,
    title: 'Market Insights',
    description: 'Access location-specific market data including rental rates, vacancy rates, and price trends.',
  },
];

const FeatureSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
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
    <section id="features" className="section bg-gray-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful features for investment analysis
          </h2>
          <p className="text-gray-600">
            Everything you need to evaluate real estate investments and make confident decisions.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="feature-card"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
