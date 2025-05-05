import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart2 } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-8 w-8 text-primary-500" />
          <span className="font-bold text-xl text-primary-700">IncomePlus</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className={`font-medium hover:text-primary-500 transition-colors ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className={`font-medium hover:text-primary-500 transition-colors ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className={`font-medium hover:text-primary-500 transition-colors ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            Pricing
          </a>
          <a
            href="#about"
            className={`font-medium hover:text-primary-500 transition-colors ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            About
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <a
            href="#get-started"
            className={`btn btn-primary hidden md:flex items-center space-x-1 ${
              isScrolled ? 'bg-primary-500' : 'bg-white text-primary-500'
            }`}
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            className={`md:hidden rounded-lg p-2 ${
              isScrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;