import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAnimation } from 'framer-motion';

interface UseScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
  animateFrom?: 'bottom' | 'left' | 'right' | 'top';
  distance?: number;
}

/**
 * Hook for creating scroll-triggered animations
 */
export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    delay = 0.2,
    animateFrom = 'bottom',
    distance = 30,
  } = options;
  
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [controls, inView, triggerOnce]);
  
  // Generate the correct animation variants based on direction
  const getDirectionalVariants = () => {
    let hiddenProps: Record<string, number> = {};
    
    switch (animateFrom) {
      case 'bottom':
        hiddenProps = { y: distance };
        break;
      case 'top':
        hiddenProps = { y: -distance };
        break;
      case 'left':
        hiddenProps = { x: -distance };
        break;
      case 'right':
        hiddenProps = { x: distance };
        break;
      default:
        hiddenProps = { y: distance };
    }
    
    return {
      hidden: {
        opacity: 0,
        ...hiddenProps,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1], // Custom ease curve for smoother motion
          delay,
        },
      },
    };
  };
  
  return {
    ref,
    controls,
    variants: getDirectionalVariants(),
    isInView: inView,
  };
};

export default useScrollAnimation; 