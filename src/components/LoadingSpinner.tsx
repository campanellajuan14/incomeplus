import React, { useEffect } from 'react';

interface LoadingSpinnerProps {
  isVisible: boolean;
  message?: string;
  variant?: 'overlay' | 'inline';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  isVisible, 
  message = "Processing...",
  variant = 'overlay'
}) => {
  // Prevent body scroll when overlay is visible
  useEffect(() => {
    if (variant === 'overlay' && isVisible) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isVisible, variant]);

  if (!isVisible) return null;

  const overlayClasses = variant === 'overlay' 
    ? "fixed inset-0 bg-white flex items-center justify-center z-[9999] transition-opacity duration-300" 
    : "flex items-center justify-center py-8";

  return (
    <div className={overlayClasses}>
      <div className="text-center">
        {/* Enhanced bouncing dots animation */}
        <div className="flex space-x-2 justify-center mb-4">
          <div 
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" 
            style={{ 
              animationDelay: '0s', 
              animationDuration: '1.4s',
              animationTimingFunction: 'ease-in-out'
            }}
          ></div>
          <div 
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" 
            style={{ 
              animationDelay: '0.2s', 
              animationDuration: '1.4s',
              animationTimingFunction: 'ease-in-out'
            }}
          ></div>
          <div 
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" 
            style={{ 
              animationDelay: '0.4s', 
              animationDuration: '1.4s',
              animationTimingFunction: 'ease-in-out'
            }}
          ></div>
        </div>
        
        {/* Animated message with fade-in effect */}
        {message && (
          <p className="text-gray-600 text-sm font-medium animate-pulse transition-all duration-500">
            {message}
          </p>
        )}
        
      </div>
    </div>
  );
};

export default LoadingSpinner;