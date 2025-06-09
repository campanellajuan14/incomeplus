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
  const [scrollProgress, setScrollProgress] = useState(0);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return { button: 'h-10 w-10', icon: 'w-4 h-4', strokeWidth: 4 };
      case 'lg': return { button: 'h-14 w-14', icon: 'w-6 h-6', strokeWidth: 5 };
      default: return { button: 'h-12 w-12', icon: 'w-5 h-5', strokeWidth: 5 };
    }
  };

  const sizeConfig = getSizeClasses();
  // Calculate inner circle size (smaller than button for inner border)
  const buttonSize = parseInt(sizeConfig.button.split(' ')[0].replace('h-', '')) * 4; // Convert to pixels
  const circleSize = buttonSize; // Make circle smaller to fit inside button
  const radius = (circleSize - sizeConfig.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const totalScrollableHeight = documentHeight - windowHeight;
      
      if (totalScrollableHeight > 0) {
        const progress = Math.max(0, Math.min(100, (scrollTop / totalScrollableHeight) * 100));
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }

      if (scrollTop > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const progressOffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50"
          style={{ bottom, right }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 25
          }}
        >
          <div className="relative flex items-center justify-center">
            <button
              className={`relative rounded-full bg-white text-primary-500 shadow-lg flex items-center justify-center border-2 border-primary-500 cursor-pointer ${sizeConfig.button}`}
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <svg
                className="absolute inset-0 transform -rotate-90"
                width={buttonSize}
                height={buttonSize}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%) rotate(-90deg)'
                }}
              >
                <circle
                  cx={buttonSize / 2}
                  cy={buttonSize / 2}
                  r={radius}
                  stroke="rgba(0, 0, 0, 0.1)"
                  strokeWidth={sizeConfig.strokeWidth}
                  fill="none"
                />
                
                <circle
                  cx={buttonSize / 2}
                  cy={buttonSize / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={sizeConfig.strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={progressOffset}
                  className="text-primary-500"
                  style={{
                    transition: 'stroke-dashoffset 0.15s ease-out'
                  }}
                />
              </svg>

              <div className="relative z-10">
                <ArrowUp className={`${sizeConfig.icon}`} strokeWidth={2} />
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop; 