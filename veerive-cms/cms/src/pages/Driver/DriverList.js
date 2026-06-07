import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import DriverContext from '../../context/DriverContext';
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from '../../html/css/Theme.module.css';
import axios from '../../config/axios';
import DriverForm from './DriverForm';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function normalizeString(str) {
    if (!str) return '';
    return String(str).replace(/[^a-zA-Z]/g, '').toLowerCase();
}

export default function DriverList() {
    const { 
        drivers, 
        driversDispatch, 
        fetchDrivers,
        fetchAllDrivers,
        fetchDriversPageData, 
        handleAddClick, 
        handleEditClick, 
        currentPage, 
        setCurrentPage,
        isFormVisible,
        setIsFormVisible,
        handleFormSubmit
    } = useContext(DriverContext);

    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;

    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'driverName', direction: 'ascending' });
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

    useEffect(() => {
        fetchDriversPageData();
    }, []);

    useEffect(() => {
        if (drivers.editId) {
            setIsFormVisible(true);
        }
    }, [drivers.editId, setIsFormVisible]);

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

    // Always use allDrivers for sorting/searching/pagination
    const sortedDrivers = useMemo(() => {
        let sortableDrivers = [...(drivers.allDrivers || [])];
        if (sortConfig !== null) {
            sortableDrivers.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'driverName':
                        aValue = normalizeString(a.driverName);
                        bValue = normalizeString(b.driverName);
                        break;
                    case 'driverDescription':
                        aValue = normalizeString(a.driverDescription);
                        bValue = normalizeString(b.driverDescription);
                        break;
                    default:
                        aValue = normalizeString(a[sortConfig.key]);
                        bValue = normalizeString(b[sortConfig.key]);
                        break;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableDrivers;
    }, [drivers.allDrivers, sortConfig]);
    
    // Search on allDrivers
    const filteredDrivers = useMemo(() => {
        return sortedDrivers.filter(driver =>
            (driver.driverName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (driver.driverDescription || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedDrivers, searchQuery]);

    // Pagination on filteredDrivers
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / itemsPerPage));
    const currentPageSafe = Math.min(currentPage, totalPages);
    const paginatedDrivers = filteredDrivers.slice((currentPageSafe - 1) * itemsPerPage, currentPageSafe * itemsPerPage);

    const handleDeleteClick = (id, driverName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Driver',
            message: `Are you sure you want to remove "${driverName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/drivers/${id}`, { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
            });
            
            if (response.data.success) {
                toast.success(response.data.message || 'Driver deleted successfully!');
                await fetchDriversPageData();
            } else {
                toast.error('Failed to delete driver');
            }
        } catch (err) {
            console.error('Error deleting driver:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete driver';
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
            const headers = [
                'Driver Name',
                'Description',
                'Icon'
            ];

            const csvData = filteredDrivers.map(driver => [
                driver.driverName || '',
                driver.driverDescription || '',
                driver.icon || ''
            ]);

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => {
                    const escapedCell = String(cell).replace(/"/g, '""');
                    return `"${escapedCell}"`;
                }).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute('download', `drivers_${new Date().toISOString().split('T')[0]}.csv`);
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
                <DriverForm handleFormSubmit={handleFormSubmit} />
            </div>
        );
    }

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2 style={{ fontSize: '1.5rem' }}>Drivers Master</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Driver
                    </button>
                    <button className={styles.primaryButton} onClick={downloadCSV}>
                        📥 Download CSV
                    </button>
                </div>
            </div>

            {/* Stats Card */}
            <div className={styles.statsCard}>
                <div className={styles.statsNumber}>{drivers.allDrivers?.length || 0}</div>
                <div className={styles.statsLabel}>Total Drivers</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchdrivers..." id="searchdrivers..." type="text"
                    placeholder="Search drivers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('driverName')}>
                                Driver Name {sortConfig.key === 'driverName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('driverDescription')}>
                                Description {sortConfig.key === 'driverDescription' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th>Icon</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDrivers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className={styles.emptyMessage}>
                                    {searchQuery.trim() ? 'No drivers found matching your search' : 'No drivers found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedDrivers.map(driver => (
                                <tr key={driver._id}>
                                    <td>{driver.driverName}</td>
                                    <td>{driver.driverDescription || 'N/A'}</td>
                                    <td>{driver.icon ? <img src={driver.icon} alt={driver.driverName} style={{ width: 28, height: 28, objectFit: 'contain' }} /> : '—'}</td>
                                    <td>
                                        <button 
                                            className={`${styles.actionButton} ${styles.editButton}`} 
                                            onClick={() => handleEditClick(driver._id)} 
                                            disabled={userRole === 'User'}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.deleteButton}`} 
                                            onClick={() => handleDeleteClick(driver._id, driver.driverName)} 
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
                        <span>Page {currentPageSafe} of {totalPages} ({filteredDrivers.length} total items)</span>
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
