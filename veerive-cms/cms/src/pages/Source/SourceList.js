import React, { useContext, useState, useEffect, useMemo } from 'react';
import SourceContext from '../../context/SourceContext';
import AuthContext from '../../context/AuthContext';
import styles from '../../html/css/Source.module.css';
import ConfirmationModal from '../../components/ConfirmationModal';
import axios from '../../config/axios';
import Papa from 'papaparse';

export default function SourceList() {
    const { sources, sourcesDispatch, handleEditClick, handleAddClick, fetchSources } = useContext(SourceContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    const [sortConfig, setSortConfig] = useState({ key: 'sourceName', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');
    const [allSources, setAllSources] = useState([]);
    const [page, setPage] = useState(1);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const itemsPerPage = 10;

    // ✅ Load sources when SourceList page is accessed
    useEffect(() => {
        if (fetchSources && sources.data.length === 0) {
            fetchSources();
        }
    }, [fetchSources, sources.data.length]);

    // Update local state when sources data is loaded
    useEffect(() => {
        if (sources.data && Array.isArray(sources.data)) {
            setAllSources(sources.data);
        } else if (sources.data && sources.data.sources && Array.isArray(sources.data.sources)) {
            setAllSources(sources.data.sources);
        } else if (sources.data) {
            setAllSources([]);
        }
    }, [sources.data]);

    // Helper function to normalize text for sorting (remove non-letters, convert to lowercase)
    const normalizeForSorting = (text) => {
        if (!text) return '';
        return String(text).replace(/[^a-zA-Z]/g, '').toLowerCase();
    };

    // Sorting and searching on all data
    const processedSources = useMemo(() => {
        let data = [...allSources];
        if (searchTerm.trim()) {
            data = data.filter(source =>
                (source.sourceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (source.sourceType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (source.generalComment || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    }, [allSources, searchTerm, sortConfig]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(processedSources.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedSources = processedSources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDeleteClick = (id, sourceName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Source',
            message: `Are you sure you want to remove "${sourceName}"? This action cannot be undone.`,
            onConfirm: () => handleDelete(id),
            itemToDelete: id
        });
    };

    const handleDelete = async (id) => {
        if (id === undefined || id === null) {
            console.error('Invalid ID:', id);
            return;
        }
        try {
            const response = await axios.delete(`/api/admin/sources/${id}`, { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
            });
            sourcesDispatch({ type: 'REMOVE_SOURCE', payload: response.data._id });
            setAllSources(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            console.error('Error deleting source:', err);
            alert('An error occurred while deleting the source.');
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleDownloadCSV = () => {
        const csvData = processedSources.map(source => ({
            'Source Name': source.sourceName || '',
            'Source Type': source.sourceType || '',
            'General Comment': source.generalComment || '',
            'Created At': source.createdAt ? new Date(source.createdAt).toLocaleDateString() : '',
            'Updated At': source.updatedAt ? new Date(source.updatedAt).toLocaleDateString() : ''
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sources_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSort = (key) => {
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
    }, [searchTerm]);

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
                <h2>Sources Master</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Source
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
                }}>{allSources.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Sources</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchsources..." id="searchsources..." type="text"
                    placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('sourceName')}>
                                Source Name {sortConfig.key === 'sourceName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => handleSort('sourceType')}>
                                Source Type {sortConfig.key === 'sourceType' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => handleSort('generalComment')}>
                                General Comment {sortConfig.key === 'generalComment' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSources.length === 0 ? (
                            <tr>
                                <td colSpan="4" className={styles.emptyMessage}>
                                    {searchTerm.trim() ? 'No sources found matching your search' : 'No sources found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedSources.map(source => (
                                <tr key={source._id}>
                                    <td>{source.sourceName}</td>
                                    <td>{source.sourceType}</td>
                                    <td>{source.generalComment || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className={`${styles.actionButton} ${styles.editButton}`} 
                                            onClick={() => handleEditClick(source._id)} 
                                            disabled={userRole === 'User'}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.deleteButton}`} 
                                            onClick={() => handleDeleteClick(source._id, source.sourceName)} 
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
                        <span>Page {currentPage} of {totalPages} ({processedSources.length} total items)</span>
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
