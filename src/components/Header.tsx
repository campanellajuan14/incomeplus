import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, X, Menu, UserCircle, LogOut, LayoutDashboard, FileSpreadsheet, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userProfile, signOut } = useAuth();
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

  const userName = userProfile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || "User";

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg py-1 xs:py-2' : 'bg-white/90 backdrop-blur-md py-2 xs:py-3 sm:py-4'
    }`}>
      <div className="container flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center relative z-10 transition-transform duration-200 hover:scale-105"
          aria-label="IncomePlus Home"
        >
          <img 
            src="/logo.png" 
            alt="IncomePlus Logo" 
            className="h-8 sm:h-10"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {/* Show different navigation items based on authentication status */}
          {user ? (
            // Show dashboard and properties when logged in
            [
              { path: '/dashboard', label: 'Dashboard' },
              { path: '/properties', label: 'Properties' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-200 text-gray-700 relative group py-1 ${
                  location.pathname === item.path || (location.pathname === '/dashboard' && item.path === '/dashboard') ? 'text-primary-600 font-semibold' : ''
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-500 transition-all duration-300 rounded-full ${
                  location.pathname === item.path || (location.pathname === '/dashboard' && item.path === '/dashboard') ? 'w-full' : 'w-0 group-hover:w-full'
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
                className={`font-medium transition-colors duration-200 text-gray-700 relative group py-1 ${
                  location.pathname === item.path ? 'text-primary-600 font-semibold' : ''
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-500 transition-all duration-300 rounded-full ${
                  location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))
          )}
        </nav>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded-full transition-all duration-200 hover:bg-primary-50 p-1"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 transition-transform duration-200 hover:scale-105">
                  <UserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="hidden md:inline-block font-medium text-gray-800">
                  {userName}
                </span>
                <span className="hidden md:block ml-1 transition-transform duration-200" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-20 transform origin-top-right transition-all duration-200 animate-fade-in border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150"
                  >
                    <User className="h-4 w-4 mr-3 text-gray-500" /> Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150"
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-500" /> Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4 mr-3" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden md:flex items-center space-x-1 btn btn-primary shadow-md hover:shadow-lg transition-all duration-300 text-sm lg:text-base py-2.5 px-4 lg:px-5 rounded-full bg-primary-500 text-white hover:bg-primary-600 hover:scale-105 transform"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 ml-1 animate-pulse-subtle" />
              </Link>
              <Link
                to="/auth"
                className="hidden md:flex font-medium text-gray-700 hover:text-primary-500 transition-colors duration-200 relative group"
              >
                Sign In
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 hover:scale-105"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div 
        id="mobile-menu"
        ref={menuRef}
        className={`md:hidden fixed top-[calc(100%)] left-0 w-full bg-white shadow-xl transform transition-all duration-300 ease-in-out max-h-[calc(100vh-80px)] overflow-y-auto ${
          isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="container py-4 space-y-2">
          {user && (
            <div className="px-4 py-3 mb-2 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          )}
        
          {/* Show different navigation items for mobile based on authentication status */}
          {user ? (
            // Show dashboard and properties when logged in (mobile)
            [
              { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { path: '/properties', label: 'Properties', icon: FileSpreadsheet },
              { path: '/profile', label: 'Profile', icon: User },
              { path: '/settings', label: 'Settings', icon: Settings }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3.5 rounded-lg transition-all duration-200 text-base ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
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
                className={`block px-4 py-3.5 rounded-lg transition-all duration-200 text-base ${
                  location.pathname === item.path 
                    ? 'bg-primary-100 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                }`}
              >
                {item.label}
              </Link>
            ))
          )}
          
          <div className="border-t border-gray-100 my-2 pt-2"></div>
          
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3.5 text-base text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-3" /> Sign out
            </button>
          ) : (
            <>
              <Link
                to="/auth"
                className="block px-4 py-3.5 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:translate-x-1"
              >
                Sign In
              </Link>
              <div className="px-4 py-2">
                <Link
                  to="/auth"
                  className="flex items-center justify-center space-x-1 py-3.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all duration-200 w-full"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
