import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook that triggers data loading only when on specific pages
 * This prevents all data from loading on login
 */
const usePageBasedLoading = (pagePaths, loadFunction, dependencies = []) => {
  const location = useLocation();
  
  useEffect(() => {
    // Check if current path matches any of the target pages
    const isOnTargetPage = pagePaths.some(path => 
      location.pathname.includes(path)
    );
    
    if (isOnTargetPage && loadFunction) {
      loadFunction();
    }
  }, [location.pathname, loadFunction, ...dependencies]);
};

export default usePageBasedLoading;
