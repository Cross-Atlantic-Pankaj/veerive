import React, { useContext, useState, useMemo, useEffect } from 'react';
import SubSectorContext from '../../context/SubSectorContext';
import SectorContext from '../../context/SectorContext';
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from '../../html/css/SubSector.module.css';
import axios from '../../config/axios';
import Papa from 'papaparse';

export default function SubSectorList() {
    const { subSectors, subSectorsDispatch, handleEditClick, handleAddClick, fetchSubSectors } = useContext(SubSectorContext);
    const { sectors, fetchSectors } = useContext(SectorContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;

    const [sortConfig, setSortConfig] = useState({ key: 'subSectorName', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const itemsPerPage = 10;

    // ✅ Load sub-sectors and sectors when SubSectorList page is accessed
    useEffect(() => {
        if (fetchSubSectors && subSectors.data.length === 0) {
            fetchSubSectors();
        }
        if (fetchSectors && sectors.data.length === 0) {
            fetchSectors(); // Load sectors for dropdown
        }
    }, [fetchSubSectors, subSectors.data.length, fetchSectors, sectors.data.length]);

    const handleDeleteClick = (id, subSectorName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Sub-Sector',
            message: `Are you sure you want to remove "${subSectorName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/sub-sectors/${id}`, { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
            });
            subSectorsDispatch({ type: 'REMOVE_SUB_SECTOR', payload: response.data._id });
        } catch (err) {
            alert(err.message);
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const findSectorName = (sectorId) => {
        const sector = sectors.data.find(s => s._id === sectorId);
        return sector ? sector.sectorName : 'Unknown Sector';
    };

    // Helper function to normalize text for sorting (remove non-letters, convert to lowercase)
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

    // Sorting logic
    const sortedSubSectors = useMemo(() => {
        let sortableSubSectors = [...subSectors.data];
        if (sortConfig !== null) {
            sortableSubSectors.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'subSectorName':
                        aValue = normalizeForSorting(a.subSectorName);
                        bValue = normalizeForSorting(b.subSectorName);
                        break;
                    case 'sector':
                        aValue = normalizeForSorting(findSectorName(a.sectorId));
                        bValue = normalizeForSorting(findSectorName(b.sectorId));
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

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableSubSectors;
    }, [subSectors.data, sortConfig, sectors.data]);

    // Filtering logic
    const filteredSubSectors = useMemo(() => {
        return sortedSubSectors.filter((subSector) => {
            const subSectorName = subSector.subSectorName.toLowerCase();
            const sectorName = findSectorName(subSector.sectorId).toLowerCase();
            const generalComment = (subSector.generalComment || '').toLowerCase();
            return (
                subSectorName.includes(searchTerm.toLowerCase()) ||
                sectorName.includes(searchTerm.toLowerCase()) ||
                generalComment.includes(searchTerm.toLowerCase())
            );
        });
    }, [sortedSubSectors, searchTerm]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredSubSectors.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedSubSectors = filteredSubSectors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

    const handleDownloadCSV = () => {
        const csvData = filteredSubSectors.map(subSector => ({
            'Sub-Sector Name': subSector.subSectorName || '',
            'Sector Name': findSectorName(subSector.sectorId),
            'General Comment': subSector.generalComment || '',
            'Created At': subSector.createdAt ? new Date(subSector.createdAt).toLocaleDateString() : '',
            'Updated At': subSector.updatedAt ? new Date(subSector.updatedAt).toLocaleDateString() : ''
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `subsectors_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2>Sub-Sectors Master</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Sub-Sector
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
                }}>{subSectors.data.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Sub-Sectors</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchsub-sectors..." id="searchsub-sectors..." type="text"
                    placeholder="Search sub-sectors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('subSectorName')}>
                                Sub-Sector Name {sortConfig.key === 'subSectorName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('sector')}>
                                Sector {sortConfig.key === 'sector' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('generalComment')}>
                                General Comment {sortConfig.key === 'generalComment' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSubSectors.length === 0 ? (
                            <tr>
                                <td colSpan="4" className={styles.emptyMessage}>
                                    {searchTerm.trim() ? 'No sub-sectors found matching your search' : 'No sub-sectors found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedSubSectors.map((subSector) => (
                                <tr key={subSector._id}>
                                    <td>{subSector.subSectorName}</td>
                                    <td>{findSectorName(subSector.sectorId)}</td>
                                    <td>{subSector.generalComment || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className={`${styles.actionButton} ${styles.editButton}`} 
                                            onClick={() => handleEditClick(subSector._id)} 
                                            disabled={userRole === 'User'}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.deleteButton}`} 
                                            onClick={() => handleDeleteClick(subSector._id, subSector.subSectorName)} 
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
                        <span>Page {currentPage} of {totalPages} ({filteredSubSectors.length} total items)</span>
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
