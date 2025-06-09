import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setupScrollRestoration } from '../utils/scrollUtils';

interface SmoothScrollProps {
  children: ReactNode;
  offset?: number;
}

const SmoothScroll = ({ children, offset = 0 }: SmoothScrollProps) => {
  const location = useLocation();
  
  useEffect(() => {
    // Setup scroll restoration
    setupScrollRestoration();
    
    // Handle hash links for smooth scrolling
    const handleHashLink = () => {
      const hash = location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 100); // Small delay to ensure DOM is ready
        }
      }
    };
    
    handleHashLink();
    
    // Additional setup for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    const handleClick = (e: Event) => {
      e.preventDefault();
      const link = e.currentTarget as HTMLAnchorElement;
      const targetId = link.getAttribute('href')?.replace('#', '');
      
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update URL hash without triggering scroll
          window.history.pushState(null, '', `#${targetId}`);
        }
      }
    };
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', handleClick);
    });
    
    return () => {
      anchorLinks.forEach(link => {
        link.removeEventListener('click', handleClick);
      });
    };
  }, [location, offset]);
  
  return <>{children}</>;
};

export default SmoothScroll; 