/**
 * Quick fix utility to add lazy loading to pages
 * This ensures data loads when pages are accessed, not on login
 */

// Template for adding useEffect to pages
export const addLazyLoadToPage = (pageName, fetchFunctionName, dataPath) => `
// ✅ Load ${pageName} data when page is accessed
useEffect(() => {
    if (${fetchFunctionName} && ${dataPath}.length === 0) {
        ${fetchFunctionName}();
    }
}, [${fetchFunctionName}, ${dataPath}.length]);
`;

// List of providers and their corresponding pages that need fixing
export const PROVIDERS_TO_FIX = [
    {
        provider: 'RegionProvider',
        page: 'RegionList',
        fetchFunction: 'fetchRegions',
        dataPath: 'regions.data'
    },
    {
        provider: 'CountryProvider', 
        page: 'CountryList',
        fetchFunction: 'fetchCountries',
        dataPath: 'countries.data'
    },
    {
        provider: 'ContextProvider',
        page: 'ContextList', 
        fetchFunction: 'fetchContexts',
        dataPath: 'contexts.data'
    },
    {
        provider: 'PostProvider',
        page: 'PostList',
        fetchFunction: 'fetchPosts', 
        dataPath: 'posts.data'
    },
    {
        provider: 'MarketDataProvider',
        page: 'MarketDataList',
        fetchFunction: 'fetchAllMarketData',
        dataPath: 'marketData.data'
    }
];

export default { addLazyLoadToPage, PROVIDERS_TO_FIX };
