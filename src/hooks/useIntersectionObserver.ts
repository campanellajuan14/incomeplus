
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  onIntersect: () => void;
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export const useIntersectionObserver = ({
  onIntersect,
  enabled = true,
  rootMargin = '100px',
  threshold = 0.1
}: UseIntersectionObserverProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [onIntersect, enabled, rootMargin, threshold]);

  return { targetRef, isIntersecting };
};
