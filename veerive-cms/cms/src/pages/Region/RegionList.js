import React, { useContext, useState, useMemo, useEffect } from 'react';
import RegionContext from '../../context/RegionContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from '../../html/css/Region.module.css';
import axios from '../../config/axios';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Papa from 'papaparse';

export default function RegionList() {
    const { regions, regionsDispatch, handleEditClick, handleAddClick, fetchRegions } = useContext(RegionContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'regionName', direction: 'ascending' });
    const [page, setPage] = useState(1);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const itemsPerPage = 10;

    // ✅ Load regions when RegionList page is accessed
    useEffect(() => {
        if (fetchRegions && regions.data.length === 0) {
            fetchRegions();
        }
    }, [fetchRegions, regions.data.length]);

    const handleDeleteClick = (id, regionName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Region',
            message: `Are you sure you want to delete "${regionName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: { id, name: regionName }
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/regions/${id}`, { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
            });
            regionsDispatch({ type: 'REMOVE_REGION', payload: response.data._id });
            toast.success('Region deleted successfully!');
        } catch (err) {
            console.error('Error deleting region:', err);
            toast.error('Failed to delete region');
        } finally {
            handleCloseModal();
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal({
            isOpen: false,
            title: '',
            message: '',
            onConfirm: null,
            itemToDelete: null
        });
    };

    // Helper function to normalize text for sorting
    const normalizeForSorting = (text) => {
        if (!text) return '';
        return String(text).replace(/[^a-zA-Z]/g, '').toLowerCase();
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Process data with search and sort
    const processedRegions = useMemo(() => {
        if (!regions?.data || !Array.isArray(regions.data)) {
            return [];
        }

        let data = [...regions.data];
        
        // Apply search filter
        if (searchQuery.trim()) {
            data = data.filter(region =>
                (region.regionName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (region.generalComment || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Apply sorting
        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aValue, bValue;
                
                switch (sortConfig.key) {
                    case 'regionName':
                        aValue = normalizeForSorting(a.regionName);
                        bValue = normalizeForSorting(b.regionName);
                        break;
                    case 'generalComment':
                        aValue = normalizeForSorting(a.generalComment);
                        bValue = normalizeForSorting(b.generalComment);
                        break;
                    default:
                        aValue = normalizeForSorting(a[sortConfig.key]);
                        bValue = normalizeForSorting(b[sortConfig.key]);
                        break;
                }
                
                // Handle null/undefined values
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        
        return data;
    }, [regions?.data, searchQuery, sortConfig]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(processedRegions.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedRegions = processedRegions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    // Reset to page 1 if current page is out of range
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setPage(1);
        }
    }, [totalPages, currentPage]);

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

    const handleDownloadCSV = () => {
        const csvData = processedRegions.map(region => ({
            'Region Name': region.regionName || '',
            'General Comment': region.generalComment || '',
            'Updated At': region.updatedAt ? new Date(region.updatedAt).toLocaleDateString() : ''
        }));
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `regions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!regions?.data) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading regions...</p>
            </div>
        );
    }
    
    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2>Regions Master</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Region
                    </button>
                    <button className={styles.primaryButton} onClick={handleDownloadCSV}>
                        📥 Download CSV
                    </button>
                </div>
            </div>

            {/* Stats Card */}
            <div className={styles.statsCard}>
                <div className={styles.statsNumber}>{regions.data.length}</div>
                <div className={styles.statsLabel}>Total Regions</div>
            </div>

            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchregions..." id="searchregions..." type="text"
                    placeholder="Search regions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('regionName')}>
                                Region Name {sortConfig.key === 'regionName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('generalComment')}>
                                Comment {sortConfig.key === 'generalComment' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRegions.length === 0 ? (
                            <tr>
                                <td colSpan="3" className={styles.emptyMessage}>
                                    {searchQuery.trim() ? 'No regions found matching your search' : 'No regions found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedRegions.map((region) => (
                                <tr key={region._id}>
                                    <td>{region.regionName}</td>
                                    <td>{region.generalComment}</td>
                                    <td>
                                        <button
                                            className={styles.actionButton}
                                            onClick={() => handleEditClick(region._id)}
                                            disabled={userRole === 'User'}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            onClick={() => handleDeleteClick(region._id, region.regionName)}
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

                <div className={styles.pagination}>
                    <button 
                        onClick={handlePrevPage}
                        disabled={page === 1}
                    >
                        ← Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={handleNextPage}
                        disabled={page === totalPages || totalPages === 0}
                    >
                        Next →
                    </button>
                </div>
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
