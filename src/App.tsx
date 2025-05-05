import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import PropertyAnalysis from './components/PropertyAnalysis';
import FinancialAnalytics from './components/FinancialAnalytics';
import Calculator from './components/Calculator';
import Testimonials from './components/Testimonials';
import Statistics from './components/Statistics';
import Benefits from './components/Benefits';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <main>
        <PropertyAnalysis />
        <FeatureSection />
        <FinancialAnalytics />
        <Calculator />
        <Statistics />
        <Testimonials />
        <Benefits />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default App;