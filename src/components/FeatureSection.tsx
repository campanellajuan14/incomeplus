
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
    <section id="features" className="section bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-60"></div>
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary-100 rounded-full text-primary-700">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful tools for investment analysis
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
              className="feature-card group hover:translate-y-[-5px]"
            >
              <div className="mb-5 p-3 bg-primary-50 rounded-xl inline-block group-hover:bg-primary-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center mt-10">
          <a href="/features" className="btn btn-primary flex items-center gap-2">
            <span>Explore All Features</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
