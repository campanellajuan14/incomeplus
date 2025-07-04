import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, HelpCircle, Calculator, Search, Home, Filter, Map, MessageCircle, FileText } from 'lucide-react';

interface PricingTierProps {
  title: string;
  price: string | number;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
}

const PricingTier: React.FC<PricingTierProps> = ({ 
  title, 
  price, 
  features, 
  isPopular = false,
  ctaText = 'Start Your Trial'
}) => (
  <div className={`relative overflow-hidden bg-white backdrop-blur-sm rounded-xl shadow-xl p-8 border-2 transition-all duration-300 ease-out flex flex-col h-full ${
    isPopular 
      ? 'border-accent-400 hover:border-accent-500' 
      : 'border-gray-100 hover:border-primary-300'
  }`}>
    {isPopular && (
      <div className="absolute top-4 -right-2 bg-red-500 text-white px-6 py-2 text-sm font-semibold transform rotate-12 shadow-lg">
        <div className="relative">
          Most Popular
          <div className="absolute -left-1 top-full w-0 h-0 border-l-4 border-l-transparent border-t-4 border-t-red-600"></div>
          <div className="absolute -right-1 top-full w-0 h-0 border-r-4 border-r-transparent border-t-4 border-t-red-600"></div>
        </div>
      </div>
    )}
    <div className="text-center mb-8 pb-6 border-b border-gray-100">
      <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
        isPopular 
          ? 'bg-accent-100 text-accent-700' 
          : 'bg-primary-100 text-primary-700'
      }`}>
        {title}
      </div>
      
      <div className="mb-3">
        {typeof price === 'number' ? (
          <div className="space-y-1">
            <div className="flex items-end justify-center gap-2">
              <span className="text-6xl font-black text-gray-900 leading-none">${price}</span>
              <span className="text-xl text-gray-600 font-medium pb-2">{price === 650 ? '/year' : '/month'}</span>
            </div>
            {price === 650 && (
              <div className="text-sm text-gray-500">
                <span className="line-through">${Math.round(65 * 12)}/year</span>
                <span className="ml-2 text-accent-600 font-semibold">Save $130</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-4xl font-black text-gray-900">{price}</div>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        {typeof price === 'number' && price === 650 && 'Paid annually'}
        {typeof price === 'number' && price !== 650 && 'Billed monthly, cancel anytime'}
        {typeof price !== 'number' && 'Custom pricing available'}
      </div>
    </div>
        <ul className="space-y-3 mb-8 flex-grow">
      {features.map((feature: string, index: number) => {
        const isAvailable = !feature.startsWith('×');
        const featureText = feature.startsWith('×') ? feature.substring(1).trim() : feature;
        
        return (
          <li key={index} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
              isAvailable 
                ? isPopular 
                  ? 'bg-accent-500 text-white' 
                  : 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}>
              <Check className="h-3 w-3" />
            </div>
            <span className={`text-sm leading-relaxed ${
              isAvailable 
                ? 'text-gray-700' 
                : 'text-gray-400'
            }`}>
              {featureText}
            </span>
          </li>
        );
      })}
    </ul>
    <button className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ease-out ${
      isPopular 
        ? 'bg-accent-400 text-white hover:bg-accent-500 hover:shadow-lg' 
        : 'bg-primary-100 text-primary-700 hover:bg-primary-200 hover:shadow-sm'
    }`}>
      {ctaText}
    </button>
  </div>
);

interface FAQProps {
  question: string;
  answer: string;
}

const FAQ: React.FC<FAQProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-primary-800">{question}</span>
        <HelpCircle className={`h-5 w-5 text-primary-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <p className="mt-2 text-gray-600">{answer}</p>}
    </div>
  );
};

const FeatureIcon: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="bg-primary-100 p-4 rounded-full mb-3 transition-all duration-300 group-hover:bg-primary-200 group-hover:shadow-md">
      {icon}
    </div>
    <p className="font-medium text-primary-800 group-hover:text-primary-600 transition-colors duration-300">{title}</p>
  </div>
);

const Pricing: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const tiers: PricingTierProps[] = [
    {
      title: 'Starter Plan',
      price: 'Free',
      features: [
        'Unlimited property uploads',
        'One time feature sheet generator',
        'Property financials',
        'Agent profile'
      ],
      ctaText: 'Start For Free'
    },
    {
      title: 'Plus Plan',
      price: billingCycle === 'monthly' ? 65 : 650,
      features: [
        'Everything in Starter plan',
        'Agent dashboard',
        'Financial performance search',
        'Dynamic mortgage-driven spreadsheet',
        'ROI calculator',
        'Unit rental breakdown',
        'Custom search filters',
        'Direct agent contact',
        'Save and compare properties'
      ],
      isPopular: true,
      ctaText: 'Get Started'
    },
    {
      title: 'Teams Plus',
      price: 'Contact for Pricing',
      features: [
        'Full platform access',
        'Suitable for brokerages',
        'Teams access management',
        'Investment groups support'
      ],
      ctaText: 'Contact Sales'
    }
  ];

  const faqs: FAQProps[] = [
    {
      question: 'What is IncomePlus?',
      answer: 'IncomePlus is a real estate investment platform that allows agents to list multi-unit and income-generating properties, and allows investors to search based on financial performance metrics like ROI, cash flow, and cap rate — not just listing price.'
    },
    {
      question: 'How is IncomePlus different from Realtor.ca or MLS?',
      answer: 'Unlike traditional platforms, IncomePlus calculates financial performance for each listing based on user-inputted mortgage settings, letting investors search by cash flow, ROI, DSR, and more. It\'s purpose-built for analyzing income properties.'
    },
    {
      question: 'Do I need a subscription to use IncomePlus?',
      answer: 'Yes. Both agents and investors require a subscription to access the platform. Agents gain the ability to upload listings and generate branded feature sheets, while investors gain access to the full search functionality and contact agents directly.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. Subscriptions are billed monthly and can be cancelled at any time through your account dashboard.'
    },
    {
      question: 'What happens after I sign up as an agent?',
      answer: 'You\'ll be prompted to enter your license number and complete payment. Once your identity is manually verified, you\'ll gain access to the dashboard to upload listings and generate PDF feature sheets.'
    },
    {
      question: 'How does the platform calculate ROI and cash flow?',
      answer: 'Every property includes a built-in financial spreadsheet that uses your mortgage settings (interest rate, amortization, down payment) to dynamically calculate cash flow, cap rate, ROI, DSR, and more — all before you reach out to an agent.'
    }
  ];

  const keyFeatures = [
    { icon: <Search className="h-6 w-6 text-primary-600" />, title: 'Financial Performance Search' },
    { icon: <Calculator className="h-6 w-6 text-primary-600" />, title: 'Dynamic Mortgage Calculator' },
    { icon: <Calculator className="h-6 w-6 text-primary-600" />, title: 'ROI Analysis Tools' },
    { icon: <Home className="h-6 w-6 text-primary-600" />, title: 'Unit Rental Tracking' },
    { icon: <Filter className="h-6 w-6 text-primary-600" />, title: 'Custom Search Filters' },
    { icon: <Map className="h-6 w-6 text-primary-600" />, title: 'Neighborhood Analytics' },
    { icon: <MessageCircle className="h-6 w-6 text-primary-600" />, title: 'Direct Agent Communication' },
    { icon: <FileText className="h-6 w-6 text-primary-600" />, title: 'Automated Feature Sheets' },
  ];

  return (
    <main className="pt-20">
      {/* <section className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://assets.website-files.com/5e51c674258ffe10d286d30a/5e5354c0c791125ec04d1a55_peakmoney-grid.svg')] opacity-5"></div>
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/30 blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full bg-accent-400/40 blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
          <div className="absolute bottom-20 right-0 w-80 h-80 rounded-full bg-secondary-500/30 blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '12s' }}></div>
        </div>
      
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Simple Pricing for Everyone
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-blue-100"
            >
              Choose the plan that fits your investment strategy
            </motion.p>
          </div>
        </div>
      </section> */}

      <section className="py-20 -mt-10">
        <div className="container">
          <div className="flex justify-center mb-10">
            <div className="bg-primary-50 p-1 rounded-full flex items-center shadow-md">
              <button 
                className={`px-6 py-2 rounded-full transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white text-primary-700 shadow-md' : 'text-primary-600 hover:text-primary-800'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button 
                className={`px-6 py-2 rounded-full transition-all duration-300 ${billingCycle === 'annual' ? 'bg-white text-primary-700 shadow-md' : 'text-primary-600 hover:text-primary-800'}`}
                onClick={() => setBillingCycle('annual')}
              >
                Annual <span className="text-sm text-accent-500 font-medium">(Save 20%)</span>
              </button>
            </div>
          </div>
          
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {tiers.map((tier, index) => (
              <PricingTier key={index} {...tier} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary-800">
            Key Platform Features
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Our comprehensive platform offers everything you need to find, analyze, and manage income-generating properties.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {keyFeatures.map((feature, index) => (
              <FeatureIcon key={index} icon={feature.icon} title={feature.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary-800">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Everything you need to know about IncomePlus
          </p>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
            {faqs.map((faq, index) => (
              <FAQ key={index} {...faq} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Pricing;
