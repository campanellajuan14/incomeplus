import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { PieChart, BarChart2, Map, DollarSign, Calculator as CalcIcon, LineChart } from 'lucide-react';

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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
              Powerful Features for Property Analysis
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-blue-100"
            >
              Everything you need to make data-driven investment decisions
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">Real-time Property Analysis</h2>
              <p className="text-gray-600 mb-8">
                Get instant insights into property performance with our comprehensive analysis tools. Calculate ROI, cash flow, and more in seconds.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <PieChart className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Financial Metrics</h3>
                    <p className="text-gray-600">Track ROI, cash flow, and cap rates</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <BarChart2 className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Market Analysis</h3>
                    <p className="text-gray-600">Compare properties and market trends</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src="https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg"
                alt="Property Analysis Dashboard"
                className="rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <CalcIcon className="h-8 w-8 text-primary-500" />,
                title: "Investment Calculator",
                description: "Calculate mortgage payments, ROI, and cash flow projections with our advanced calculator."
              },
              {
                icon: <Map className="h-8 w-8 text-primary-500" />,
                title: "Market Research",
                description: "Access detailed market data, trends, and property comparisons in your target area."
              },
              {
                icon: <DollarSign className="h-8 w-8 text-primary-500" />,
                title: "Financial Planning",
                description: "Plan your investment strategy with comprehensive financial analysis tools."
              },
              {
                icon: <LineChart className="h-8 w-8 text-primary-500" />,
                title: "Performance Tracking",
                description: "Monitor property performance and track your investment portfolio growth."
              },
              {
                icon: <PieChart className="h-8 w-8 text-primary-500" />,
                title: "Portfolio Analysis",
                description: "Analyze your entire property portfolio with detailed insights and reports."
              },
              {
                icon: <BarChart2 className="h-8 w-8 text-primary-500" />,
                title: "Custom Reports",
                description: "Generate professional reports for your properties and investments."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-500 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start analyzing properties?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of investors making data-driven decisions with IncomePlus
          </p>
          <button className="btn bg-white text-primary-600 hover:bg-gray-100 transition-all">
            Get Started Free
          </button>
        </div>
      </section>
    </main>
  );
};

export default Features;
