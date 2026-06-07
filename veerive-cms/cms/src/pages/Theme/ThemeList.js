import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import ThemeContext from '../../context/ThemeContext';
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from '../../html/css/Theme.module.css';
import axios from '../../config/axios';
import ThemeForm from './ThemeForm';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function normalizeString(str) {
    if (!str) return '';
    return String(str).replace(/[^a-zA-Z]/g, '').toLowerCase();
}

export default function ThemeList() {
    const { 
        themes, 
        themesDispatch, 
        fetchThemes,
        fetchAllThemes,
        fetchThemesPageData, 
        handleAddClick, 
        handleEditClick, 
        sectors, 
        subSectors,
        currentPage, 
        setCurrentPage,
        isFormVisible,
        setIsFormVisible,
        handleFormSubmit
    } = useContext(ThemeContext);

    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;

    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'themeTitle', direction: 'ascending' });
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const location = useLocation();
    const query = useQuery();
    const editIdFromQuery = query.get('editId');
    const prevEditId = useRef();
    const [isRefreshingThemes, setIsRefreshingThemes] = useState(false);

    useEffect(() => {
        fetchThemesPageData();
    }, []);

    useEffect(() => {
        if (themes.editId) {
            setIsFormVisible(true);
        }
    }, [themes.editId, setIsFormVisible]);

    useEffect(() => {
        if (editIdFromQuery) {
            handleEditClick(editIdFromQuery);
        }
    }, [editIdFromQuery, handleEditClick]);

    useEffect(() => {
        if (location.state && location.state.editId && location.state.editId !== prevEditId.current) {
            handleEditClick(location.state.editId);
            prevEditId.current = location.state.editId;
        }
    }, [location.state && location.state.editId, handleEditClick]);

    const getSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown';
        return ids.map(id => {
            const item = data.find(ele => ele._id === id);
            return item ? item.sectorName : 'Unknown';
        }).join(', '); 
    };

    const getSubSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown';
        return ids.map(id => {
            const item = data.find(ele => ele._id === id);
            return item ? item.subSectorName : 'Unknown';
        }).join(', '); 
    };

    // Always use allThemes for sorting/searching/pagination
    const sortedThemes = useMemo(() => {
        let sortableThemes = [...(themes.allThemes || [])];
        if (sortConfig !== null) {
            sortableThemes.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'themeTitle':
                        aValue = normalizeString(a.themeTitle);
                        bValue = normalizeString(b.themeTitle);
                        break;
                    case 'sectors':
                        aValue = normalizeString(getSectorNames(a.sectors, sectors.data));
                        bValue = normalizeString(getSectorNames(b.sectors, sectors.data));
                        break;
                    case 'subSectors':
                        aValue = normalizeString(getSubSectorNames(a.subSectors, subSectors.data));
                        bValue = normalizeString(getSubSectorNames(b.subSectors, subSectors.data));
                        break;
                    case 'generalComment':
                        aValue = normalizeString(a.generalComment);
                        bValue = normalizeString(b.generalComment);
                        break;
                    case 'themeDescription':
                        aValue = normalizeString(a.themeDescription);
                        bValue = normalizeString(b.themeDescription);
                        break;
                    case 'trendingScore':
                    case 'impactScore':
                    case 'predictiveMomentumScore':
                    case 'overallScore':
                        // Numeric comparison for scores
                        aValue = Number(a[sortConfig.key]) || 0;
                        bValue = Number(b[sortConfig.key]) || 0;
                        break;
                    default:
                        aValue = normalizeString(a[sortConfig.key]);
                        bValue = normalizeString(b[sortConfig.key]);
                        break;
                }

                // Handle numeric fields differently
                if (['trendingScore', 'impactScore', 'predictiveMomentumScore', 'overallScore'].includes(sortConfig.key)) {
                    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                } else {
                    // String comparison for text fields
                    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }
            });
        }
        return sortableThemes;
    }, [themes.allThemes, sortConfig, sectors.data, subSectors.data]);
    
    // Search on allThemes
    const filteredThemes = useMemo(() => {
        return sortedThemes.filter(theme =>
            (theme.themeTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            getSectorNames(theme.sectors, sectors.data).toLowerCase().includes(searchQuery.toLowerCase()) ||
            getSubSectorNames(theme.subSectors, subSectors.data).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (theme.generalComment || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedThemes, searchQuery, sectors.data, subSectors.data]);

    // Pagination on filteredThemes
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(filteredThemes.length / itemsPerPage));
    const currentPageSafe = Math.min(currentPage, totalPages);
    const paginatedThemes = filteredThemes.slice((currentPageSafe - 1) * itemsPerPage, currentPageSafe * itemsPerPage);

    const handleDeleteClick = (id, themeTitle) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Theme',
            message: `Are you sure you want to remove "${themeTitle}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/themes/${id}`, { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
            });
            
            if (response.data.success) {
                toast.success(response.data.message || 'Theme deleted successfully!');
                await fetchThemesPageData(); // Refresh the themes list and ensure sectors/sub-sectors are loaded
            } else {
                toast.error('Failed to delete theme');
            }
        } catch (err) {
            console.error('Error deleting theme:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete theme';
            toast.error(errorMessage);
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const downloadCSV = () => {
        try {
            // Prepare headers
            const headers = [
                'Theme Title',
                'Is Trending',
                'Sectors',
                'Sub-Sectors',
                'General Comment',
                'Theme Description',
                'Trending Score',
                'Impact Score',
                'Predictive Momentum Score',
                'Overall Score'
            ];

            // Prepare data rows (all filtered themes, not just current page)
            const csvData = filteredThemes.map(theme => [
                theme.themeTitle || '',
                theme.isTrending ? 'Yes' : 'No',
                getSectorNames(theme.sectors, sectors.data),
                getSubSectorNames(theme.subSectors, subSectors.data),
                theme.generalComment || '',
                theme.themeDescription || '',
                theme.trendingScore || '0',
                theme.impactScore || '0',
                theme.predictiveMomentumScore || '0',
                theme.overallScore || '0'
            ]);

            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => {
                    // Escape commas and quotes in cell values
                    const escapedCell = String(cell).replace(/"/g, '""');
                    return `"${escapedCell}"`;
                }).join(','))
            ].join('\n');

            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute('download', `themes_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('✅ CSV file downloaded successfully!');
        } catch (error) {
            console.error('Error generating CSV:', error);
            toast.error('❌ Failed to generate CSV file');
        }
    };

    if (isFormVisible) {
        return (
            <div className={styles.contentContainer}>
                <ThemeForm handleFormSubmit={handleFormSubmit} />
            </div>
        );
    }

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2 style={{ fontSize: '1.5rem' }}>Themes Master</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Theme
                    </button>
                    <button className={styles.primaryButton} onClick={downloadCSV}>
                        📥 Download CSV
                    </button>
                </div>
            </div>

            {/* Stats Card */}
            <div className={styles.statsCard}>
                <div className={styles.statsNumber}>{themes.allThemes?.length || 0}</div>
                <div className={styles.statsLabel}>Total Themes</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchthemes..." id="searchthemes..." type="text"
                    placeholder="Search themes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('themeTitle')}>
                                Theme Title {sortConfig.key === 'themeTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('sectors')}>
                                Sectors {sortConfig.key === 'sectors' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('subSectors')}>
                                Sub-Sectors {sortConfig.key === 'subSectors' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('generalComment')}>
                                General Comment {sortConfig.key === 'generalComment' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedThemes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className={styles.emptyMessage}>
                                    {searchQuery.trim() ? 'No themes found matching your search' : 'No themes found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedThemes.map(ele => (
                                <tr key={ele._id}>
                                    <td>{ele.themeTitle}</td>
                                    <td>{getSectorNames(ele.sectors, sectors.data)}</td>
                                    <td>{getSubSectorNames(ele.subSectors, subSectors.data)}</td>
                                    <td>{ele.generalComment || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className={`${styles.actionButton} ${styles.editButton}`} 
                                            onClick={() => handleEditClick(ele._id)} 
                                            disabled={userRole === 'User'}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.deleteButton}`} 
                                            onClick={() => handleDeleteClick(ele._id, ele.themeTitle)} 
                                            disabled={userRole === 'User'}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            disabled={currentPageSafe === 1}
                            onClick={() => {
                                const newPage = Math.max(currentPageSafe - 1, 1);
                                setCurrentPage(newPage);
                                localStorage.setItem('currentPage', newPage);
                            }}
                        >
                            Previous
                        </button>
                        <span>Page {currentPageSafe} of {totalPages} ({filteredThemes.length} total items)</span>
                        <button
                            disabled={currentPageSafe >= totalPages}
                            onClick={() => {
                                const newPage = Math.min(currentPageSafe + 1, totalPages);
                                setCurrentPage(newPage);
                                localStorage.setItem('currentPage', newPage);
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            
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
