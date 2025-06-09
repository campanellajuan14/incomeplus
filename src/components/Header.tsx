
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BarChart2, X, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-4'
    }`}>
      <div className="container flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 relative z-10"
          aria-label="IncomePlus Home"
        >
          <BarChart2 className="h-8 w-8 text-primary-500" />
          <span className="font-bold text-xl text-primary-700">IncomePlus</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-10">
          {[
            { path: '/', label: 'Home' },
            { path: '/features', label: 'Features' },
            { path: '/pricing', label: 'Pricing' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-medium hover:text-primary-500 transition-colors duration-200 text-gray-700 relative group ${
                location.pathname === item.path ? 'text-primary-500' : ''
              }`}
            >
              {item.label}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full ${
                location.pathname === item.path ? 'w-full' : ''
              }`}></span>
            </Link>
          ))}
          <Link
            to="/auth"
            className="font-medium text-gray-700 hover:text-primary-500 transition-colors duration-200"
          >
            Sign In
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link
            to="/auth"
            className="hidden md:flex items-center space-x-1 btn btn-primary shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="container py-4 space-y-4">
          {[
            { path: '/', label: 'Home' },
            { path: '/features', label: 'Features' },
            { path: '/pricing', label: 'Pricing' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
                location.pathname === item.path 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            className="flex items-center justify-center space-x-1 mx-4 py-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-200"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
