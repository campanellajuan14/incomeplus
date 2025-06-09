
import { useState, useEffect, useCallback } from 'react';

interface UseInfinitePropertiesProps {
  filteredProperties: any[];
  itemsPerPage?: number;
}

export const useInfiniteProperties = ({
  filteredProperties,
  itemsPerPage = 5
}: UseInfinitePropertiesProps) => {
  const [displayedProperties, setDisplayedProperties] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset displayed properties when filtered properties change
  useEffect(() => {
    const initialProperties = filteredProperties.slice(0, itemsPerPage);
    setDisplayedProperties(initialProperties);
    setHasMore(filteredProperties.length > itemsPerPage);
  }, [filteredProperties, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const currentLength = displayedProperties.length;
      const nextProperties = filteredProperties.slice(0, currentLength + itemsPerPage);
      
      setDisplayedProperties(nextProperties);
      setHasMore(nextProperties.length < filteredProperties.length);
      setIsLoadingMore(false);
    }, 300);
  }, [displayedProperties.length, filteredProperties, itemsPerPage, isLoadingMore, hasMore]);

  return {
    displayedProperties,
    hasMore,
    isLoadingMore,
    loadMore
  };
};
