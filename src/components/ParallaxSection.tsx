import { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // Speed multiplier for parallax effect
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const ParallaxSection = ({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
}: ParallaxSectionProps) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const { scrollYProgress } = useScroll();
  
  // Calculate parallax transform based on direction
  const getTransformValue = () => {
    switch (direction) {
      case 'up':
        return useTransform(scrollYProgress, [0, 1], ['0%', `${-50 * speed}%`]);
      case 'down':
        return useTransform(scrollYProgress, [0, 1], ['0%', `${50 * speed}%`]);
      case 'left':
        return useTransform(scrollYProgress, [0, 1], ['0%', `${-50 * speed}%`]);
      case 'right':
        return useTransform(scrollYProgress, [0, 1], ['0%', `${50 * speed}%`]);
      default:
        return useTransform(scrollYProgress, [0, 1], ['0%', `${-50 * speed}%`]);
    }
  };

  // Get the appropriate transform property based on direction
  const transform = getTransformValue();
  
  const isHorizontal = direction === 'left' || direction === 'right';
  
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        style={{
          [isHorizontal ? 'x' : 'y']: transform,
        }}
        animate={{
          opacity: inView ? 1 : 0,
        }}
        transition={{
          opacity: { duration: 0.5 },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection;
