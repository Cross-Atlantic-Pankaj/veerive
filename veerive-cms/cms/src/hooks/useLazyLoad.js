import { useState, useCallback } from 'react';

/**
 * Custom hook for lazy loading data
 * Only loads data when explicitly requested, not on mount
 */
const useLazyLoad = (fetchFunction, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (...args) => {
    if (loading) return; // Prevent multiple simultaneous calls
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(...args);
      setData(result);
      setLoaded(true);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading]);

  const clearData = useCallback(() => {
    setData(initialData);
    setLoaded(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    loaded,
    error,
    loadData,
    clearData,
    setData // Allow manual data updates
  };
};

export default useLazyLoad;
