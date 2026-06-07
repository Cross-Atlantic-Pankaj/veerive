import React, { useContext, useState, useMemo, useEffect, useCallback } from 'react'; // Importing necessary hooks and components from React
import ContextContext from '../../context/ContextContext'; // Importing the context for managing global state
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import SignalContext from '../../context/SignalContext';
import SubSignalContext from '../../context/SubSignalContext';
import ThemeContext from '../../context/ThemeContext';
import axios from '../../config/axios'; // Importing axios instance for making HTTP requests
import '../../html/css/Context.css'; // Importing the CSS file for styling the component
import { format } from 'date-fns';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import { toast } from 'react-toastify'; // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import toast styles
import Papa from 'papaparse'; // For CSV generation
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import AuthContext from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// Defining the ContextList functional component
export default function ContextList() {
    // Destructuring necessary state and functions from ContextContext
    const { contexts, contextsDispatch, handleAddClick, handleEditClick, searchQuery, setSearchQuery, sectors, subSectors, themes, signals, subSignals, setIsLoading, fetchContexts, isLoading } = useContext(ContextContext);
    const { page, setPage, totalPages } = useContext(ContextContext);  // ✅ Use global state
    const { allThemes } = useContext(ContextContext); // ✅ Use allThemes
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    
    // ✅ Get fetch functions from dependency contexts
    const { fetchSectors } = useContext(SectorContext);
    const { fetchSubSectors } = useContext(SubSectorContext);
    const { fetchSignals } = useContext(SignalContext);
    const { fetchSubSignals } = useContext(SubSignalContext);
    const { fetchThemes } = useContext(ThemeContext);
    
    // Local state to manage the search query and sorting configuration
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
    const [localSearchQuery, setLocalSearchQuery] = useState(''); // Local search state
    const [contextsData, setContextsData] = useState([]); // ✅ New local state for rendering
    const [downloadStartDate, setDownloadStartDate] = useState('');
    const [downloadEndDate, setDownloadEndDate] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [postsMap, setPostsMap] = useState({}); // Store post ID to title mapping
    const [allContexts, setAllContexts] = useState([]); // Store all contexts
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const location = useLocation();
    const query = useQuery();
    const navigate = useNavigate();

    // Get the filter parameters from URL
    const filterContextIds = query.get('filterContexts')?.split(',').filter(Boolean) || [];

    // Debug logging for filter parameter

    // ✅ Load all dependencies when ContextList page is accessed
    useEffect(() => {
        if (fetchSectors && sectors.data.length === 0) {
            fetchSectors(); // Load sectors for dropdown
        }
        if (fetchSubSectors && subSectors.data.length === 0) {
            fetchSubSectors(); // Load sub-sectors for dropdown
        }
        if (fetchSignals && signals.data.length === 0) {
            fetchSignals(); // Load signals for dropdown
        }
        if (fetchSubSignals && subSignals.data.length === 0) {
            fetchSubSignals(); // Load sub-signals for dropdown
        }
        if (fetchThemes && themes.data.length === 0) {
            fetchThemes(); // Load themes for dropdown
        }
    }, [fetchSectors, sectors.data.length, fetchSubSectors, subSectors.data.length, fetchSignals, signals.data.length, fetchSubSignals, subSignals.data.length, fetchThemes, themes.data.length]);

    // Fetch all contexts when component mounts
    useEffect(() => {
        const fetchAllContexts = async () => {
            try {
                const response = await axios.get('/api/admin/contexts/all', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    setAllContexts(response.data.contexts || []);
                }
            } catch (err) {
                console.error('Error fetching all contexts:', err);
                toast.error('Failed to fetch contexts data');
            }
        };
        fetchAllContexts();
    }, []);

    useEffect(() => {
        // ✅ Update local state whenever contexts are updated
        setContextsData(contexts.data || []);
    }, [contexts.data]);  // ✅ Ensures UI updates correctly

    useEffect(() => {
        const savedPage = localStorage.getItem("contextPage");
        if (savedPage) {
            setPage(parseInt(savedPage)); // ✅ Restore last viewed page on reload
        }
    }, []);

    useEffect(() => {
        if (page) {
            localStorage.setItem("contextPage", page); // ✅ Store last visited page
        }
    }, [page]);

    // Fetch contexts from the API on component mount or when the context changes
    useEffect(() => {
        const fetchContexts = async () => {
            setIsLoading(true);
    
            try {
                // If sorting is active, fetch all contexts for proper cross-page sorting
                const needsAllData = sortConfig.key !== 'contextTitle' || sortConfig.direction !== 'ascending' || sortConfig.key === 'date';
                const apiUrl = needsAllData 
                    ? `/api/admin/contexts/all`
                    : `/api/admin/contexts?page=${page}&limit=10`;
                const response = await axios.get(apiUrl, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                });
    
                if (response.data.success) {
                    const contextsData = response.data.contexts || [];
                    
                    if (needsAllData) {
                        // Store all contexts and calculate pagination client-side
                        setAllContexts(contextsData);
                        const totalItems = contextsData.length;
                        const calculatedTotalPages = Math.ceil(totalItems / 10);
                        contextsDispatch({ 
                            type: "SET_CONTEXTS", 
                            payload: { 
                                contexts: contextsData, 
                                totalPages: calculatedTotalPages, 
                                page: page
                            } 
                        });
                    } else {
                        // Use server pagination for default view
                        contextsDispatch({ 
                            type: "SET_CONTEXTS", 
                            payload: { 
                                contexts: contextsData, 
                                totalPages: response.data.totalPages || 1, 
                                page: response.data.page || 1
                            } 
                        });
                    }
                }
            } catch (err) {
                console.error("❌ Error fetching contexts:", err);
                toast.error("❌ Error fetching contexts.");
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchContexts();
    }, [page, sortConfig]); // ✅ Re-fetch when page OR sortConfig changes
    
    // Helper function to get sector names from IDs
    const getSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if IDs are not an array
        const sectorNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the sector by ID
            return item ? item.sectorName : 'Unknown'; // Return the sector name or 'Unknown' if not found
        });
        return sectorNames.join(', '); // Join sector names with a comma
    };

    // Helper function to get sub-sector names from IDs
    const getSubSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if IDs are not an array
        const subSectorNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the sub-sector by ID
            return item ? item.subSectorName : 'Unknown'; // Return the sub-sector name or 'Unknown' if not found
        });
        return subSectorNames.join(', '); // Join sub-sector names with a comma
    };

    // Helper function to get signal names from IDs
    const getSignalNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if IDs are not an array
        const signalNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the signal by ID
            return item ? item.signalName : 'Unknown'; // Return the signal name or 'Unknown' if not found
        });
        return signalNames.join(', '); // Join signal names with a comma
    };

    // Helper function to get theme names from IDs
    const getThemeNames = (ids) => {
        if (!Array.isArray(ids)) return 'Unknown';
        
        return ids.map(id => {
            const matchedTheme = allThemes.find(theme => theme._id === id);
            return matchedTheme ? matchedTheme.themeTitle : 'Unknown Theme';
        }).join(', ');
    };

    // Helper function to normalize text for sorting (remove non-letters, convert to lowercase)
    const normalizeForSorting = (text) => {
        if (!text) return '';
        return String(text).replace(/[^a-zA-Z]/g, '').toLowerCase();
    };

    // Consolidated sorting and filtering logic - NOW uses localSearchQuery instead of searchQuery
    const processedContexts = useMemo(() => {
        // Determine which dataset to use
        const isSortingActive = sortConfig.key !== 'contextTitle' || sortConfig.direction !== 'ascending';
        const isSearchActive = localSearchQuery.trim().length > 0;
        const isFilterActive = filterContextIds.length > 0;
        
        // When filtering is active, always use client-side mode with all available data
        let data = [];
        if (isFilterActive) {
            // For filtering, use all available data (prefer allContexts, fallback to contexts.data)
            data = allContexts.length > 0 ? allContexts : (contexts.data || []);
        } else {
            // Normal behavior for search/sort
            data = (isSearchActive || isSortingActive) ? allContexts : (contexts.data || []);
        }
        
        // Apply context ID filter if present
        if (filterContextIds.length > 0) {
            
            data = data.filter(context => {
                const contextId = String(context._id);
                const isMatch = filterContextIds.some(filterId => {
                    const filterIdStr = String(filterId).trim();
                    const match = filterIdStr === contextId;
                    if (match) {
                    }
                    return match;
                });
                return isMatch;
            });
            
        }

        // Apply search filter using localSearchQuery
        if (localSearchQuery.trim()) {
            data = data.filter(context => {
                const formattedDate = format(new Date(context.date), 'yyyy-MM-dd');
                return (
                    (context.contextTitle && context.contextTitle.toLowerCase().includes(localSearchQuery.toLowerCase())) ||
                    (formattedDate && formattedDate.startsWith(localSearchQuery))
                );
            });
        }

        // Apply sorting
        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'date':
                        aValue = new Date(a.date);
                        bValue = new Date(b.date);
                        break;
                    case 'contextTitle':
                        aValue = normalizeForSorting(a.contextTitle);
                        bValue = normalizeForSorting(b.contextTitle);
                        break;
                    case 'displayOrder':
                        aValue = a.displayOrder || 0;
                        bValue = b.displayOrder || 0;
                        break;
                    case 'containerType':
                        aValue = normalizeForSorting(a.containerType);
                        bValue = normalizeForSorting(b.containerType);
                        break;
                    case 'sectors':
                        aValue = normalizeForSorting(getSectorNames(a.sectors, sectors.data));
                        bValue = normalizeForSorting(getSectorNames(b.sectors, sectors.data));
                        break;
                    case 'subSectors':
                        aValue = normalizeForSorting(getSubSectorNames(a.subSectors, subSectors.data));
                        bValue = normalizeForSorting(getSubSectorNames(b.subSectors, subSectors.data));
                        break;
                    case 'signalCategories':
                        aValue = normalizeForSorting(getSignalNames(a.signalCategories, signals.data));
                        bValue = normalizeForSorting(getSignalNames(b.signalCategories, signals.data));
                        break;
                    case 'themes':
                        aValue = normalizeForSorting(getThemeNames(a.themes));
                        bValue = normalizeForSorting(getThemeNames(b.themes));
                        break;
                    default:
                        aValue = normalizeForSorting(a[sortConfig.key]);
                        bValue = normalizeForSorting(b[sortConfig.key]);
                        break;
                }

                // Handle null/undefined values
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                // For dates and numbers, use direct comparison
                if (sortConfig.key === 'date') {
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                } else if (sortConfig.key === 'displayOrder') {
                    // Numeric comparison for display order
                    const numA = Number(aValue) || 0;
                    const numB = Number(bValue) || 0;
                    if (numA < numB) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (numA > numB) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                } else {
                    // String comparison for text fields (already normalized)
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }
            });
        }

        return data;
    }, [allContexts, contexts.data, localSearchQuery, sortConfig, filterContextIds, sectors.data, subSectors.data, signals.data, allThemes]);

    // Determine if we're in search mode or sorting mode
    const isSearchMode = localSearchQuery.trim().length > 0;
    const isSortingActive = sortConfig.key !== 'contextTitle' || sortConfig.direction !== 'ascending' || sortConfig.key === 'date';
    const isFilterMode = filterContextIds.length > 0;
    const isClientSideMode = isSearchMode || isSortingActive || isFilterMode;

    // Calculate pagination for processed data
    const itemsPerPage = 10;
    const totalFilteredItems = processedContexts.length;
    const totalFilteredPages = Math.ceil(totalFilteredItems / itemsPerPage);
    
    // In client-side mode (search or sorting), apply pagination to processed data
    // In server-side mode, use backend paginated data as-is
    const currentPageData = isClientSideMode 
        ? processedContexts.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        : processedContexts;

    // Use appropriate total pages with fallback
    const displayTotalPages = isClientSideMode ? totalFilteredPages : (totalPages || 1);

    // Debug logging
    // Update pagination when filtered results change
    useEffect(() => {
        if (isClientSideMode && page > totalFilteredPages && totalFilteredPages > 0) {
            setPage(1);
        }
    }, [totalFilteredPages, page, setPage, isClientSideMode]);
    
    // Handle the removal of a context
    const handleRemoveClick = (id, contextTitle) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Context',
            message: `Are you sure you want to delete "${contextTitle}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/contexts/${id}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });

            if (response.status === 200) {
                // ✅ Refresh the page data after deletion to get latest data from server
                await refreshContextData();
                
                // ✅ Check if current page is now empty and adjust pagination
                const currentPageItemsCount = currentPageData.length;
                if (currentPageItemsCount === 1 && page > 1) {
                    // If we just deleted the last item on this page and we're not on page 1, go to previous page
                    const newPage = page - 1;
                    setPage(newPage);
                    localStorage.setItem('contextPage', newPage);
                }
                
                toast.success('Context removed successfully!');
            }
        } catch (error) {
            toast.error('Failed to delete context. Please try again.');
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    // ✅ Function to refresh all context data after operations
    const refreshContextData = async () => {
        try {
            // Refresh all contexts data
            const allContextsResponse = await axios.get('/api/admin/contexts/all', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (allContextsResponse.data.success) {
                setAllContexts(allContextsResponse.data.contexts || []);
            }

            // Refresh paginated contexts data
            const needsAllData = sortConfig.key !== 'contextTitle' || sortConfig.direction !== 'ascending' || sortConfig.key === 'date';
            const apiUrl = needsAllData 
                ? `/api/admin/contexts/all`
                : `/api/admin/contexts?page=${page}&limit=10`;

            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (response.data.success) {
                const contextsData = response.data.contexts || [];
                
                if (needsAllData) {
                    const totalItems = contextsData.length;
                    const calculatedTotalPages = Math.ceil(totalItems / 10);
                    
                    contextsDispatch({ 
                        type: "SET_CONTEXTS", 
                        payload: { 
                            contexts: contextsData, 
                            totalPages: calculatedTotalPages, 
                            page: page
                        } 
                    });
                } else {
                    contextsDispatch({ 
                        type: "SET_CONTEXTS", 
                        payload: { 
                            contexts: contextsData, 
                            totalPages: response.data.totalPages || 1, 
                            page: response.data.page || 1
                        } 
                    });
                }
            }
        } catch (err) {
            console.error("❌ Error refreshing context data:", err);
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    // Handle search input change
    const handleSearch = (e) => {
        setLocalSearchQuery(e.target.value);
    };

    const handleNextPage = () => {
        if (page < displayTotalPages) {
            setPage(page + 1);
            localStorage.setItem('contextPage', page + 1);  // ✅ Store updated page in local storage
        }
    };
    
    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
            localStorage.setItem('contextPage', page - 1);  // ✅ Store updated page in local storage
        }
    };
    
    // Request to sort contexts by a specific key
    const requestSort = (key) => {
        let direction = 'ascending'; // Default sorting direction
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'; // Toggle direction if the same key is clicked
        }
        setSortConfig({ key, direction }); // Update sort configuration
    };

    // Fetch all posts to create ID to title mapping
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('/api/admin/posts/all', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    const posts = response.data.posts || [];
                    const mapping = {};
                    posts.forEach(post => {
                        mapping[post._id] = post.postTitle;
                    });
                    setPostsMap(mapping);
                }
            } catch (err) {
                console.error('Error fetching posts:', err);
                toast.error('Failed to fetch posts data');
            }
        };
        fetchPosts();
    }, []);

    // Helper to get context data with labels for CSV
    const getContextRowForCSV = (context) => {
        // Get post titles from the postsMap
        const postTitles = (context.posts || [])
            .map(p => postsMap[p.postId] || 'Unknown Post')
            .join(', ');

        return {
            Date: context.date,
            'Context Title': context.contextTitle,
            'Display Order': context.displayOrder,
            'Container Type': context.containerType,
            Sectors: getSectorNames(context.sectors, sectors.data),
            'Sub-Sectors': getSubSectorNames(context.subSectors, subSectors.data),
            'Signal Categories': getSignalNames(context.signalCategories, signals.data),
            Themes: getThemeNames(context.themes),
            'Is Trending': context.isTrending ? 'Yes' : 'No',
            'General Comment': context.generalComment || '',
            'Posts': postTitles,
        };
    };

    // Download handler
    const handleDownloadCSV = async () => {
        if (Object.keys(postsMap).length === 0) {
            toast.error('Please wait while posts data is being loaded');
            return;
        }

        setIsDownloading(true);
        try {
            let apiUrl = '/api/admin/contexts/all';
            const params = [];
            if (downloadStartDate) params.push(`startDate=${downloadStartDate}`);
            if (downloadEndDate) params.push(`endDate=${downloadEndDate}`);
            if (params.length > 0) apiUrl += '?' + params.join('&');

            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            const allContexts = response.data.contexts || response.data || [];

            let filtered = allContexts;
            if (downloadStartDate || downloadEndDate) {
                filtered = allContexts.filter(ctx => {
                    const ctxDate = new Date(ctx.date);
                    const start = downloadStartDate ? new Date(downloadStartDate) : null;
                    const end = downloadEndDate ? new Date(downloadEndDate) : null;
                    return (!start || ctxDate >= start) && (!end || ctxDate <= end);
                });
            }

            const csvRows = filtered.map(getContextRowForCSV);
            const csv = Papa.unparse(csvRows);

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'contexts.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Failed to download CSV');
            console.error(err);
        } finally {
            setIsDownloading(false);
        }
    };

    // Get current date in IST timezone
    const getCurrentDateInIST = () => {
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // IST is UTC+5:30
        return istTime.toISOString().split('T')[0];
    };

    const currentDateInIST = getCurrentDateInIST();

    if (isLoading) return <LoadingSpinner />;

    // Render the component
    return (
        <div className="context-list-container">
            <div className="heading-beautiful">Contexts Master</div>
            
            {/* Stats Card */}
            <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                margin: '20px 0',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#4F46E5',
                    marginBottom: '8px'
                }}>{allContexts.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Contexts</div>
            </div>

            {/* Filter Status Indicator */}
            {filterContextIds.length > 0 && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '12px',
                    margin: '10px 0',
                    textAlign: 'center',
                    color: '#92400e'
                }}>
                    🔍 Filtering by Context ID(s): <strong>Showing {processedContexts.length} filtered context{processedContexts.length !== 1 ? 's' : ''}</strong>
                    <br />
                    <small>Showing contexts that match the selected filter criteria</small>
                </div>
            )}
            
            <div className="top-bar">
                <div className="left-controls">
                    <button className="add-context-btn" onClick={handleAddClick} disabled={userRole === 'User'}>Add Context</button>
                    {filterContextIds.length > 0 && (
                        <button 
                            onClick={() => navigate('/contexts')}
                            style={{
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                marginLeft: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear Filter ({filterContextIds.length} ID{filterContextIds.length > 1 ? 's' : ''})
                        </button>
                    )}
                </div>
                <div className="center-controls">
                    <label>
                        Start Date:
                        <input name="date" id="dateField" type="date" value={downloadStartDate} onChange={e => setDownloadStartDate(e.target.value)} placeholder="dd-mm-yyyy" max={currentDateInIST} />
                    </label>
                    <label>
                        End Date:
                        <input name="date" id="dateField" type="date" value={downloadEndDate} onChange={e => setDownloadEndDate(e.target.value)} placeholder="dd-mm-yyyy" max={currentDateInIST} />
                    </label>
                    <button onClick={handleDownloadCSV} disabled={isDownloading} style={{ minWidth: '120px' }}>
                        {isDownloading ? 'Downloading...' : 'Download CSV'}
                    </button>
                </div>
                <div className="right-controls">
                    <input name="searchbytitleordate..." id="searchbytitleordate..." type="text"
                        placeholder="Search by Title or Date..."
                        value={localSearchQuery}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
            </div>
            <table className="context-table">
                <thead>
                <tr>
                    {/* Table headers with sorting functionality */}
                    <th onClick={() => requestSort('date')}>
                        Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                    </th>

                    <th onClick={() => requestSort('contextTitle')}>
                        Context Title {sortConfig.key === 'contextTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => requestSort('displayOrder')}>
                        Context Display Order {sortConfig.key === 'displayOrder' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => requestSort('containerType')}>
                        Context Container Type {sortConfig.key === 'containerType' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => requestSort('sectors')}>
                        Sectors {sortConfig.key === 'sectors' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => requestSort('subSectors')}>
                        Sub-Sectors {sortConfig.key === 'subSectors' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => requestSort('signalCategories')}>
                        Signal Categories {sortConfig.key === 'signalCategories' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => requestSort('themes')}>
                        Themes {sortConfig.key === 'themes' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                    </th>
                    <th>Is Trending</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {/* Table body with context data */}
                {currentPageData.length > 0 ? (
                    currentPageData.map((ele) => (
                        <tr key={ele._id}>
                            <td className="date-cell">{
                                ele.date && (
                                    <>
                                        <span className="date-main">{formatTz(toZonedTime(ele.date, 'Asia/Kolkata'), 'yyyy-MM-dd')}</span><br />
                                        <span className="date-time">{formatTz(toZonedTime(ele.date, 'Asia/Kolkata'), 'HH:mm:ss')} IST</span>
                                    </>
                                )
                            }</td>
                            <td>{ele.contextTitle}</td>
                            <td>{ele.displayOrder}</td>
                            <td>{ele.containerType}</td>
                            <td>{getSectorNames(ele.sectors, sectors.data)}</td>
                            <td>{getSubSectorNames(ele.subSectors, subSectors.data)}</td>
                            <td>{getSignalNames(ele.signalCategories, signals.data)}</td>
                            <td>{getThemeNames(ele.themes)}</td>
                            <td>{ele.isTrending ? 'Yes' : 'No'}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="edit-btn" onClick={() => handleEditClick(ele._id)} disabled={userRole === 'User'}>✏️ Edit</button>
                                    <button className="remove-btn" onClick={() => handleRemoveClick(ele._id, ele.contextTitle)} disabled={userRole === 'User'}>🗑️ Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="10" style={{ textAlign: 'center' }}>
                            {filterContextIds.length > 0 
                                ? 'No matching contexts found for selected filter'
                                : localSearchQuery.trim()
                                ? 'No contexts found matching your search'
                                : 'No contexts found'}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
        {isSearchMode ? (
            <div className="pagination">
                <span>Showing {currentPageData.length} of {totalFilteredItems} results for "{localSearchQuery}"</span>
                {totalFilteredPages > 1 && (
                    <>
                        <button 
                            onClick={handlePrevPage}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span> Page {page} of {displayTotalPages} </span>
                        <button 
                            onClick={handleNextPage}
                            disabled={page === displayTotalPages || displayTotalPages === 0}
                        >
                            Next
                        </button>
                    </>
                )}
            </div>
        ) : isFilterMode ? (
            <div className="pagination">
                <span>Showing {currentPageData.length} of {totalFilteredItems} filtered contexts</span>
                {totalFilteredPages > 1 && (
                    <>
                        <button 
                            onClick={handlePrevPage}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span> Page {page} of {displayTotalPages} </span>
                        <button 
                            onClick={handleNextPage}
                            disabled={page === displayTotalPages || displayTotalPages === 0}
                        >
                            Next
                        </button>
                    </>
                )}
            </div>
        ) : isSortingActive ? (
            <div className="pagination">
                <button 
                    onClick={handlePrevPage}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span> Page {page} of {displayTotalPages} ({totalFilteredItems} total items - sorted) </span>
                <button 
                    onClick={handleNextPage}
                    disabled={page === displayTotalPages || displayTotalPages === 0}
                >
                    Next
                </button>
            </div>
        ) : (
        <div className="pagination">
                <button 
                    onClick={handlePrevPage}  // ✅ Handle Previous Page
                    disabled={page === 1}     // ✅ Disable on First Page
                >
                    Previous
                </button>

                <span> Page {page} of {displayTotalPages} </span>  {/* ✅ Display Current Page & Total Pages */}

                <button 
                    onClick={handleNextPage}  // ✅ Handle Next Page
                    disabled={page === displayTotalPages || displayTotalPages === 0}  // ✅ Disable on Last Page or when no pages
                >
                    Next
                </button>
            </div>
        )}
        
        <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={handleCloseModal}
            onConfirm={confirmationModal.onConfirm}
            title={confirmationModal.title}
            message={confirmationModal.message}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
        />
            </div>
    );
}
