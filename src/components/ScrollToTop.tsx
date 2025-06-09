import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  showAfter?: number; // Pixels to scroll before showing button
  bottom?: number; // Distance from bottom in pixels
  right?: number; // Distance from right in pixels
  size?: 'sm' | 'md' | 'lg';
}

const ScrollToTop = ({
  showAfter = 300,
  bottom = 20,
  right = 20,
  size = 'md',
}: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-10 w-10 text-sm';
      case 'lg': return 'h-14 w-14 text-lg';
      default: return 'h-12 w-12 text-md';
    }
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className={`fixed rounded-full bg-primary-500 text-white shadow-lg flex items-center justify-center z-50 hover:bg-primary-600 transition-colors ${getSizeClasses()}`}
          style={{ bottom, right }}
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label="Scroll to top"
        >
          <ArrowUp />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop; 