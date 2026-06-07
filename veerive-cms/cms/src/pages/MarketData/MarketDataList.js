import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import CSVUploader from '../../components/CSVUploader';
import ConfirmationModal from '../../components/ConfirmationModal';
import Papa from 'papaparse';
import styles from '../../html/css/MarketData.module.css';

const MarketDataList = () => {
    const [marketData, setMarketData] = useState({ data: [], totalPages: 1, currentPage: 1 });
    const [allMarketData, setAllMarketData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });
    const [page, setPage] = useState(1);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const itemsPerPage = 10;
    const navigate = useNavigate();

    // Debounced search effect
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setSearchQuery(localSearchQuery);
            setPage(1); // Reset to first page when searching
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [localSearchQuery]);

    // Fetch paginated data
    const fetchMarketData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/market-data?page=${page}&limit=${itemsPerPage}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setMarketData({
                data: response.data.marketData || [],
                totalPages: response.data.totalPages || 1,
                currentPage: response.data.currentPage || 1
            });
        } catch (error) {
            console.error('Error fetching market data:', error);
            toast.error('Failed to fetch market data');
            setMarketData({ data: [], totalPages: 1, currentPage: 1 });
        } finally {
            setLoading(false);
        }
    }, [page]);

    // Fetch all data for search functionality
    const fetchAllMarketData = useCallback(async () => {
        try {
            const response = await axios.get('/api/admin/market-data/all', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setAllMarketData(response.data.marketData || []);
        } catch (error) {
            console.error('Error fetching all market data:', error);
            setAllMarketData([]);
        }
    }, []);

    // Effects
    useEffect(() => {
        fetchMarketData();
    }, [fetchMarketData]);

    useEffect(() => {
        fetchAllMarketData();
    }, [fetchAllMarketData]);

    const handleUploadSuccess = () => {
        fetchMarketData();
        fetchAllMarketData();
        toast.success('Data uploaded successfully!');
    };

    // Helper function to normalize text for sorting (remove non-letters, convert to lowercase)
    const normalizeForSorting = (text) => {
        if (!text) return '';
        return String(text).replace(/[^a-zA-Z]/g, '').toLowerCase();
    };

    // Search and sort processing
    const processedData = useMemo(() => {
        // Use allMarketData for search mode, marketData.data for normal pagination
        let data = searchQuery.trim() ? allMarketData : (marketData.data || []);
        
        // Apply search filter
        if (searchQuery.trim()) {
            data = data.filter(row => {
                const searchFields = [
                    row.title,
                    row.dataDescription,
                    row.sourceName,
                    row.sector?.name || row.sector?.sectorName,
                    row.subSector?.name || row.subSector?.subSectorName
                ];
                
                return searchFields.some(field => 
                    field && String(field).toLowerCase().includes(searchQuery.toLowerCase())
                );
            });
        }
        
        // Apply sorting
        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aValue, bValue;
                
                switch (sortConfig.key) {
                    case 'createdAt':
                        aValue = new Date(a.createdAt || 0);
                        bValue = new Date(b.createdAt || 0);
                        break;
                    case 'title':
                        aValue = normalizeForSorting(a.title);
                        bValue = normalizeForSorting(b.title);
                        break;
                    case 'dataDescription':
                        aValue = normalizeForSorting(a.dataDescription);
                        bValue = normalizeForSorting(b.dataDescription);
                        break;
                    case 'sourceName':
                        aValue = normalizeForSorting(a.sourceName);
                        bValue = normalizeForSorting(b.sourceName);
                        break;
                    case 'sector':
                        aValue = normalizeForSorting(a.sector?.name || a.sector?.sectorName);
                        bValue = normalizeForSorting(b.sector?.name || b.sector?.sectorName);
                        break;
                    case 'subSector':
                        aValue = normalizeForSorting(a.subSector?.name || a.subSector?.subSectorName);
                        bValue = normalizeForSorting(b.subSector?.name || b.subSector?.subSectorName);
                        break;
                    case 'csvUpload':
                        aValue = normalizeForSorting(a.csvUpload);
                        bValue = normalizeForSorting(b.csvUpload);
                        break;
                    default:
                        aValue = normalizeForSorting(a[sortConfig.key]);
                        bValue = normalizeForSorting(b[sortConfig.key]);
                        break;
                }
                
                // Handle null/undefined values
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';
                
                // Handle dates vs strings differently
                if (sortConfig.key === 'createdAt') {
                    // Date comparison
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                } else {
                    // String comparison (already normalized)
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
    }, [allMarketData, marketData.data, searchQuery, sortConfig]);

    // Determine if we're in search mode
    const isSearchMode = searchQuery.trim().length > 0;

    // Calculate pagination for processed data
    const totalFilteredItems = processedData.length;
    const totalFilteredPages = Math.ceil(totalFilteredItems / itemsPerPage);
    
    // In search mode, show all results. In normal mode, use server pagination
    const currentPageData = isSearchMode 
        ? processedData // Show all filtered results when searching
        : processedData; // Use backend paginated data as-is in normal mode

    // Use appropriate total pages with fallback
    const displayTotalPages = isSearchMode ? totalFilteredPages : (marketData.totalPages || 1);

    // CSV download (all filtered/sorted data)
    const handleDownloadCSV = () => {
        const csvData = processedData.map(row => {
            return {
                createdAt: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
                title: row.title,
                dataDescription: row.dataDescription,
                sector: row.sector?.name || row.sector?.sectorName || '',
                subSector: row.subSector?.name || row.subSector?.subSectorName || '',
                sourceName: row.sourceName,
                csvUpload: row.csvUpload || ''
            };
        });
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'market_data_raw.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Pagination handlers
    const handleNextPage = () => {
        if (page < displayTotalPages) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    // Reset page if current page is beyond total pages
    useEffect(() => {
        if (page > displayTotalPages && displayTotalPages > 0) {
            setPage(1);
        }
    }, [displayTotalPages, page]);

    // Handle search input change
    const handleSearch = (e) => {
        setLocalSearchQuery(e.target.value);
    };

    // Get table headers
    const tableHeaders = [
        { key: 'createdAt', label: 'Created At' },
        { key: 'title', label: 'Title' },
        { key: 'dataDescription', label: 'Data Description' },
        { key: 'sector', label: 'Sector' },
        { key: 'subSector', label: 'Sub Sector' },
        { key: 'sourceName', label: 'Source Name' },
        { key: 'csvUpload', label: 'CSV Upload' }
    ];

    const handleDeleteClick = (id, title) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Market Data',
            message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            onConfirm: () => handleDelete(id),
            itemToDelete: id
        });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/admin/market-data/${id}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            
            toast.success('Market data deleted successfully!');
            fetchMarketData();
            fetchAllMarketData();
        } catch (error) {
            console.error('Error deleting market data:', error);
            toast.error('Failed to delete market data');
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2>Market Data List</h2>
                <div className={styles.headerActions}>
                    <CSVUploader
                        endpoint="/api/admin/market-data/bulk"
                        onUploadSuccess={handleUploadSuccess}
                        requiredFields={['title','dataDescription','sector','subSector','sourceName']}
                        lookupFields={{}}
                        fieldMappings={{}}
                    />
                    <button 
                        className={styles.primaryButton}
                        onClick={() => navigate('/market-data/add')}
                    >
                        Add New
                    </button>
                    <button 
                        className={styles.primaryButton}
                        onClick={handleDownloadCSV}
                    >
                        Download Raw CSV
                    </button>
                </div>
            </div>
            
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
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '8px'
                }}>{allMarketData.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Market Data Items</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchallfields..." id="searchallfields..." type="text"
                    placeholder="Search all fields..."
                    value={localSearchQuery}
                    onChange={handleSearch}
                    className={styles.searchInput}
                />
            </div>
                
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Loading market data...</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    {tableHeaders.map(header => (
                                        <th key={header.key} onClick={() => requestSort(header.key)}>
                                            {header.label} {sortConfig.key === header.key && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                                        </th>
                                    ))}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPageData.length === 0 ? (
                                    <tr>
                                        <td colSpan={tableHeaders.length + 1} className={styles.emptyMessage}>
                                            {searchQuery.trim() ? 'No market data found matching your search' : 'No market data found'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentPageData.map((data) => (
                                        <tr key={data._id}>
                                            <td>{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}</td>
                                            <td>{data.title}</td>
                                            <td>{data.dataDescription}</td>
                                            <td>{data.sector?.name || data.sector?.sectorName || 'N/A'}</td>
                                            <td>{data.subSector?.name || data.subSector?.subSectorName || 'N/A'}</td>
                                            <td>{data.sourceName}</td>
                                            <td>{data.csvUpload || 'N/A'}</td>
                                            <td>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => navigate(`/market-data/edit/${data._id}`)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                                    onClick={() => handleDeleteClick(data._id, data.title)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        
                        {isSearchMode ? (
                            <div className={styles.pagination}>
                                <span>Showing all {currentPageData.length} results for "{searchQuery}"</span>
                            </div>
                        ) : (
                            <div className={styles.pagination}>
                                <button 
                                    onClick={handlePrevPage}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <span>Page {page} of {displayTotalPages}</span>
                                <button 
                                    onClick={handleNextPage}
                                    disabled={page === displayTotalPages || displayTotalPages === 0}
                                >
                                    Next
                                </button>
                            </div>
                        )}
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
};

export default MarketDataList; 