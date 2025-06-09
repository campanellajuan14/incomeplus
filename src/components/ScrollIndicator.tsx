import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollIndicatorProps {
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
}

const ScrollIndicator = ({
  color = '#3b82f6', // default blue color
  height = 4,
  position = 'top'
}: ScrollIndicatorProps) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Only show indicator after scrolling down a bit
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.div
      className="fixed left-0 right-0 z-50"
      style={{
        top: position === 'top' ? 0 : 'auto',
        bottom: position === 'bottom' ? 0 : 'auto',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <motion.div 
        className="origin-left"
        style={{ 
          scaleX,
          height,
          backgroundColor: color,
        }} 
      />
    </motion.div>
  );
};

export default ScrollIndicator; 