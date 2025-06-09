import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rebecca Wilson',
    role: 'Real Estate Investor',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    quote: 'IncomePlus is a true time-saver for all investors. I\'m able to analyze properties in minutes that used to take me hours to evaluate. The interface is intuitive and the reports are comprehensive.',
    rating: 5,
  },
  {
    id: 2,
    name: 'David Johnson',
    role: 'Property Manager',
    image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    quote: 'The comprehensive tools in IncomePlus make it easy to evaluate properties. In just 10 minutes, I can analyze a property that would have taken me hours. My clients love the detailed reports and clear analytics.',
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
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

  return (
    <section className="section bg-gray-50">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by over 200,000 professionals worldwide
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-blue-50 p-6 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <svg className="h-8 w-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 18H3V8l10 5l8-5v5h2V6.5a1.5 1.5 0 0 0-1.5-1.5h-19A1.5 1.5 0 0 0 1 6.5v13A1.5 1.5 0 0 0 2.5 21h18a1.5 1.5 0 0 0 1.5-1.5V12h-2v7.5a.5.5 0 0 1-.5.5h-7Z" />
              </svg>
              <h3 className="text-xl font-bold">Real Estate Investors</h3>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-primary-600">345,000+</p>
              <p className="text-gray-600 mt-1">Properties Analyzed</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-blue-50 p-6 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <svg className="h-8 w-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 18H3V8l10 5l8-5v5h2V6.5a1.5 1.5 0 0 0-1.5-1.5h-19A1.5 1.5 0 0 0 1 6.5v13A1.5 1.5 0 0 0 2.5 21h18a1.5 1.5 0 0 0 1.5-1.5V12h-2v7.5a.5.5 0 0 1-.5.5h-7Z" />
              </svg>
              <h3 className="text-xl font-bold">Property Managers</h3>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-primary-600">28,500+</p>
              <p className="text-gray-600 mt-1">Reports Created</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-blue-50 p-6 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <svg className="h-8 w-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 18H3V8l10 5l8-5v5h2V6.5a1.5 1.5 0 0 0-1.5-1.5h-19A1.5 1.5 0 0 0 1 6.5v13A1.5 1.5 0 0 0 2.5 21h18a1.5 1.5 0 0 0 1.5-1.5V12h-2v7.5a.5.5 0 0 1-.5.5h-7Z" />
              </svg>
              <h3 className="text-xl font-bold">Realtors</h3>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-primary-600">15,300+</p>
              <p className="text-gray-600 mt-1">Active monthly users</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: testimonial.id * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-gray-600">{testimonial.quote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;