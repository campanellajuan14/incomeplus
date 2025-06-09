
import Hero from '../components/Hero';
import FeatureSection from '../components/FeatureSection';
import PropertyAnalysis from '../components/PropertyAnalysis';
import FinancialAnalytics from '../components/FinancialAnalytics';
import Calculator from '../components/Calculator';
import Testimonials from '../components/Testimonials';
import Statistics from '../components/Statistics';
import Benefits from '../components/Benefits';
import CallToAction from '../components/CallToAction';

function Home() {
  return (
    <main>
      <Hero />
      <PropertyAnalysis />
      <FeatureSection />
      <FinancialAnalytics />
      <Calculator />
      <Statistics />
      <Testimonials />
      <Benefits />
      <CallToAction />
    </main>
  );
}

export default Home;
