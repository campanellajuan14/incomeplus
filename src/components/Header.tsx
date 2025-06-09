
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, X, Menu, UserCircle, LogOut, LayoutDashboard, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
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
    setShowUserMenu(false);
  }, [location]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) && showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "User";

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-1 xs:py-2' : 'bg-white/95 backdrop-blur-md py-2 xs:py-3 sm:py-4'
    }`}>
      <div className="container flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center relative z-10"
          aria-label="IncomePlus Home"
        >
          <img 
            src="/lovable-uploads/d63f3e54-8fc1-4eed-bbd0-a2fde47ccb2a.png" 
            alt="IncomePlus Logo" 
            className="h-8 sm:h-10"
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
          {user ? (
            [
              { path: '/dashboard', label: 'Dashboard' },
              { path: '/properties', label: 'Properties Sheet' }
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
            ))
          ) : (
            // Show Home, Features and Pricing when not logged in
            [
              { path: '/', label: 'Home' },
              { path: '/features', label: 'Features' },
              { path: '/pricing', label: 'Pricing' }
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
            ))
          )}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                  <UserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="hidden md:inline-block font-medium">
                  {userName}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
                  <Link
                    to="/dashboard"
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Link>
                  <Link
                    to="/properties"
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" /> Properties Sheet
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden md:flex items-center space-x-1 btn btn-primary shadow-md hover:shadow-lg transition-all duration-200 text-sm lg:text-base py-2 px-3 lg:px-4 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                to="/auth"
                className="hidden md:flex font-medium text-gray-700 hover:text-primary-500 transition-colors duration-200"
              >
                Sign In
              </Link>
            </>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>
      </div>
      
      <div 
        id="mobile-menu"
        ref={menuRef}
        className={`md:hidden fixed top-[calc(100%)] left-0 w-full bg-white shadow-lg transform transition-all duration-300 ease-in-out max-h-[calc(100vh-80px)] overflow-y-auto ${
          isOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="container py-4 space-y-4">
          {user ? (
            [
              { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { path: '/properties', label: 'Properties Sheet', icon: FileSpreadsheet }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-base ${
                  location.pathname === item.path 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                {item.label}
              </Link>
            ))
          ) : (
            // Show Home, Features and Pricing when not logged in (mobile)
            [
              { path: '/', label: 'Home' },
              { path: '/features', label: 'Features' },
              { path: '/pricing', label: 'Pricing' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition-colors duration-200 text-base ${
                  location.pathname === item.path 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))
          )}
          
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-3" /> Sign out
            </button>
          ) : (
            <>
              <Link
                to="/auth"
                className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="flex items-center justify-center space-x-1 mx-4 py-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-200"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
