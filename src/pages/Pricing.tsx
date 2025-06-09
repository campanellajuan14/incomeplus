
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, HelpCircle } from 'lucide-react';

interface PricingTierProps {
  title: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

const PricingTier: React.FC<PricingTierProps> = ({ title, price, features, isPopular = false }) => (
  <div className={`bg-white rounded-lg shadow-lg p-8 ${isPopular ? 'border-2 border-primary-500 relative' : ''}`}>
    {isPopular && (
      <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
        Most Popular
      </div>
    )}
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold">${price}</span>
      <span className="text-gray-500">/mo</span>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature: string, index: number) => (
        <li key={index} className="flex items-start gap-2">
          <Check className="h-5 w-5 text-primary-500 mt-1 flex-shrink-0" />
          <span className="text-gray-600">{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
      isPopular 
        ? 'bg-primary-500 text-white hover:bg-primary-600' 
        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }`}>
      {price === 0 ? 'Start Free Trial' : 'Start Your Trial'}
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
        <span className="font-medium">{question}</span>
        <HelpCircle className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <p className="mt-2 text-gray-600">{answer}</p>}
    </div>
  );
};

const Pricing: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const tiers: PricingTierProps[] = [
    {
      title: 'Starter',
      price: 0,
      features: [
        'Up to 15 saved properties',
        'Basic property analysis',
        'Standard reports',
        'Email support'
      ]
    },
    {
      title: 'Plus',
      price: 10,
      features: [
        'Up to 50 saved properties',
        'Advanced analysis tools',
        'Custom reports',
        'Priority support',
        'Property comparison'
      ],
      isPopular: true
    },
    {
      title: 'Pro',
      price: 20,
      features: [
        'Unlimited saved properties',
        'Advanced analysis tools',
        'Custom reports & branding',
        'Priority support',
        'API access',
        'Team collaboration'
      ]
    }
  ];

  const faqs: FAQProps[] = [
    {
      question: 'How does the free trial work?',
      answer: 'Start with our Starter plan at no cost. You can analyze up to 15 properties and access basic features. Upgrade anytime to unlock more capabilities.'
    },
    {
      question: 'Can I cancel or change my subscription at any time?',
      answer: 'Yes, you can cancel or modify your subscription at any time. No long-term commitments required.'
    },
    {
      question: 'Do you offer refunds?',
      answer: `We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, we'll provide a full refund.`
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for business accounts.'
    }
  ];

  return (
    <main className="pt-20">
      <section className="bg-primary-500 text-white py-20">
        <div className="container">
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
              Start free and upgrade as you grow. No credit card required.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-20 -mt-10">
        <div className="container">
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

      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Every plan includes these powerful features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              'Property Analysis Tools',
              'Cash Flow Calculator',
              'Comparative Market Analysis',
              'Investment Returns Calculator',
              'Property Reports',
              'Market Insights',
              'Mobile App Access',
              'Email Support',
              'Regular Updates'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQ key={index} {...faq} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-500 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of investors making better decisions with IncomePlus
          </p>
          <button className="btn bg-white text-primary-600 hover:bg-gray-100 transition-all">
            Start Your Free Trial
          </button>
        </div>
      </section>
    </main>
  );
};

export default Pricing;
