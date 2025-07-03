import React, { useState, useEffect, useRef } from 'react';
import { generateBlurDataUrl } from '../utils/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'skeleton';
  blurDataUrl?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'blur',
  blurDataUrl,
  onLoad,
  onError,
  priority = false,
  sizes,
  style
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate default blur placeholder if not provided
  const defaultBlurDataUrl = blurDataUrl || generateBlurDataUrl(width || 40, height || 40);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const renderSkeleton = () => (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        ...style
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
    </div>
  );

  const renderBlurPlaceholder = () => (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        ...style
      }}
    >
      <img
        src={defaultBlurDataUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
        style={{ filter: 'blur(8px)' }}
      />
      <div className="absolute inset-0 bg-gray-100 opacity-50"></div>
    </div>
  );

  const renderErrorPlaceholder = () => (
    <div
      className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        ...style
      }}
    >
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  if (isError) {
    return renderErrorPlaceholder();
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        ...style
      }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          {placeholder === 'skeleton' ? renderSkeleton() : renderBlurPlaceholder()}
        </div>
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          style={style}
        />
      )}
    </div>
  );
};

export default OptimizedImage; 