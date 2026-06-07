import React, { useContext, useState, useMemo, useEffect } from 'react';
import SectorContext from '../../context/SectorContext';
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from '../../html/css/Sector.module.css';
import axios from '../../config/axios';
import Papa from 'papaparse';

export default function SectorList() {
    const { 
        sectors, 
        sectorsDispatch, 
        handleEditClick, 
        handleAddClick, 
        loadSectors, 
        loading, 
        loaded 
    } = useContext(SectorContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    const [sortConfig, setSortConfig] = useState({ key: 'sectorName', direction: 'ascending' });
    const [searchQuery, setSearchQuery] = useState('');
    const [allSectors, setAllSectors] = useState([]);
    const [page, setPage] = useState(1);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const itemsPerPage = 10;

    // Load sectors only when this component mounts (lazy loading)
    useEffect(() => {
        if (!loaded && !loading && loadSectors) {
            loadSectors();
        }
    }, [loaded, loading, loadSectors]);

    // Update local state when sectors data is loaded
    useEffect(() => {
        if (sectors.data && Array.isArray(sectors.data)) {
            setAllSectors(sectors.data);
        } else if (sectors.data && sectors.data.sectors && Array.isArray(sectors.data.sectors)) {
            setAllSectors(sectors.data.sectors);
        } else if (sectors.data) {
            setAllSectors([]);
        }
    }, [sectors.data]);

    // Helper function to normalize text for sorting (remove non-letters, convert to lowercase)
    const normalizeForSorting = (text) => {
        if (!text) return '';
        return String(text).replace(/[^a-zA-Z]/g, '').toLowerCase();
    };

    // Sorting and searching on all data
    const processedSectors = useMemo(() => {
        let data = [...allSectors];
        if (searchQuery.trim()) {
            data = data.filter(sector =>
                (sector.sectorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (sector.generalComment || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (sortConfig !== null) {
            data.sort((a, b) => {
                const aValue = normalizeForSorting(a[sortConfig.key]);
                const bValue = normalizeForSorting(b[sortConfig.key]);
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [allSectors, searchQuery, sortConfig]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(processedSectors.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedSectors = processedSectors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDeleteClick = (id, sectorName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Sector',
            message: `Are you sure you want to remove "${sectorName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/sectors/${id}`, { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
            });
            sectorsDispatch({ type: 'REMOVE_SECTOR', payload: response.data._id });
            setAllSectors(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            alert(err.message);
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleDownloadCSV = () => {
        const csvData = processedSectors.map(sector => ({
            'Sector Name': sector.sectorName || '',
            'General Comment': sector.generalComment || '',
            'Created At': sector.createdAt ? new Date(sector.createdAt).toLocaleDateString() : '',
            'Updated At': sector.updatedAt ? new Date(sector.updatedAt).toLocaleDateString() : ''
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sectors_${new Date().toISOString().split('T')[0]}.csv`);
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

    // Reset to page 1 if search/filter changes and current page is out of range
    useEffect(() => {
        if (currentPage > totalPages) {
            setPage(1);
        }
    }, [totalPages, currentPage]);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2>Sectors Master</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Sector
                    </button>
                    <button className={styles.primaryButton} onClick={handleDownloadCSV}>
                        📥 Download CSV
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
                }}>{allSectors.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Sectors</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchsectors..." id="searchsectors..." type="text"
                    placeholder="Search sectors..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('sectorName')}>
                                Sector Name {sortConfig.key === 'sectorName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('generalComment')}>
                                General Comment {sortConfig.key === 'generalComment' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSectors.length === 0 ? (
                            <tr>
                                <td colSpan="3" className={styles.emptyMessage}>
                                    {searchQuery.trim() ? 'No sectors found matching your search' : 'No sectors found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedSectors.map((sector) => (
                                <tr key={sector._id}>
                                    <td>{sector.sectorName}</td>
                                    <td>{sector.generalComment || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className={`${styles.actionButton} ${styles.editButton}`} 
                                            onClick={() => handleEditClick(sector._id)} 
                                            disabled={userRole === 'User'}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.deleteButton}`} 
                                            onClick={() => handleDeleteClick(sector._id, sector.sectorName)} 
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
                        <button onClick={handlePrevPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages} ({processedSectors.length} total items)</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
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
