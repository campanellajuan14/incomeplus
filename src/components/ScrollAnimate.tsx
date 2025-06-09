import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import useScrollAnimation from '../hooks/useScrollAnimation';

interface ScrollAnimateProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
  animateFrom?: 'bottom' | 'left' | 'right' | 'top';
  distance?: number;
}

const ScrollAnimate = ({
  children,
  className = '',
  threshold,
  triggerOnce,
  delay,
  animateFrom,
  distance,
}: ScrollAnimateProps) => {
  const { ref, controls, variants } = useScrollAnimation({
    threshold,
    triggerOnce,
    delay,
    animateFrom,
    distance,
  });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimate; 