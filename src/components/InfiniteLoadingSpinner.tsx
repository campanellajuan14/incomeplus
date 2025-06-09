import React from 'react';

interface InfiniteLoadingSpinnerProps {
  isVisible: boolean;
  message?: string;
}

const InfiniteLoadingSpinner: React.FC<InfiniteLoadingSpinnerProps> = ({ 
  isVisible, 
  message = "Loading more..."
}) => {
  if (!isVisible) return null;

  return (
    <>
      <style>
        {`
          @keyframes smoothWave {
            0%, 100% {
              transform: translateY(0px) scale(1);
              opacity: 0.4;
            }
            50% {
              transform: translateY(-8px) scale(1.1);
              opacity: 0.8;
            }
          }
          
          @keyframes gentleFlow {
            0% {
              transform: translateX(-150%);
              opacity: 0;
            }
            50% {
              opacity: 0.6;
            }
            100% {
              transform: translateX(250%);
              opacity: 0;
            }
          }
          
          .smooth-wave {
            animation: smoothWave 1.8s ease-in-out infinite;
          }
          
          .gentle-flow {
            animation: gentleFlow 3s ease-in-out infinite;
          }
        `}
      </style>
      
      <div className="flex items-center justify-center py-8 px-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-end space-x-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-1 h-1 bg-primary-300 rounded-full smooth-wave"
                style={{
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </div>
          
          <div className="w-16 h-0.5 bg-gray-100 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-transparent via-primary-300 to-transparent rounded-full gentle-flow" />
          </div>
          
          {message && (
            <p className="text-gray-300 text-xs font-light opacity-60">
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default InfiniteLoadingSpinner; 