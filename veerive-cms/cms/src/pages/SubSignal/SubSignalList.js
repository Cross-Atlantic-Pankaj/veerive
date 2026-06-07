import React, { useContext, useState, useMemo, useEffect } from 'react';
import SubSignalContext from '../../context/SubSignalContext';
import SignalContext from '../../context/SignalContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import axios from '../../config/axios';
import styles from '../../html/css/SubSignal.module.css';
import AuthContext from '../../context/AuthContext';

export default function SubSignalList() {
    const { subSignals, subSignalsDispatch, handleEditClick, fetchSubSignals } = useContext(SubSignalContext);
    const { signals, fetchSignals } = useContext(SignalContext);
    const { state } = useContext(SubSignalContext);
    const { state: authState } = useContext(AuthContext);
    const userRole = authState.user?.role;

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [sortConfig, setSortConfig] = useState({ key: 'subSignalName', direction: 'ascending' });
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });

    // ✅ Load sub-signals and signals when SubSignalList page is accessed
    useEffect(() => {
        if (fetchSubSignals && subSignals.data.length === 0) {
            fetchSubSignals();
        }
        if (fetchSignals && signals.data.length === 0) {
            fetchSignals(); // Load signals for dropdown
        }
    }, [fetchSubSignals, subSignals.data.length, fetchSignals, signals.data.length]);

    const handleRemoveClick = (id, subSignalName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Sub-Signal',
            message: `Are you sure you want to remove "${subSignalName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/sub-signals/${id}`, { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
            });
            subSignalsDispatch({ type: 'REMOVE_SUBSIGNAL', payload: response.data._id });
        } catch (err) {
            console.error('Error removing sub-signal:', err);
            alert(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const findSignalName = (signalId) => {
        const signal = signals.data.find(s => s._id === signalId);
        return signal ? signal.signalName : 'Unknown Signal';
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Filter, sort, and paginate sub-signals
    const filteredSubSignals = useMemo(() => {
        if (!searchTerm.trim()) return subSignals.data;
        return subSignals.data.filter(subSignal =>
            subSignal.subSignalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subSignal.generalComment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            findSignalName(subSignal.signalId)?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subSignals.data, searchTerm, signals.data]);

    const sortedSubSignals = useMemo(() => {
        let sortableSubSignals = [...filteredSubSignals];
        if (sortConfig !== null) {
            sortableSubSignals.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'subSignalName':
                        aValue = a.subSignalName.toLowerCase();
                        bValue = b.subSignalName.toLowerCase();
                        break;
                    case 'signal':
                        aValue = findSignalName(a.signalId).toLowerCase();
                        bValue = findSignalName(b.signalId).toLowerCase();
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
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
        return sortableSubSignals;
    }, [filteredSubSignals, sortConfig, signals.data]);

    const paginatedSubSignals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedSubSignals.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedSubSignals, currentPage]);

    const totalPages = Math.ceil(sortedSubSignals.length / itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const downloadCSV = () => {
        try {
            // Prepare CSV data with actual names instead of object IDs
            const csvData = subSignals.data.map(subSignal => ({
                'Sub-Signal Name': subSignal.subSignalName || '',
                'Signal Name': findSignalName(subSignal.signalId) || '',
                'General Comment': subSignal.generalComment || '',
                'Created At': subSignal.createdAt ? new Date(subSignal.createdAt).toLocaleDateString() : '',
                'Updated At': subSignal.updatedAt ? new Date(subSignal.updatedAt).toLocaleDateString() : ''
            }));

            // Convert to CSV string
            const headers = Object.keys(csvData[0] || {});
            const csvString = [
                headers.join(','),
                ...csvData.map(row => 
                    headers.map(header => {
                        const value = row[header] || '';
                        // Escape commas and quotes in CSV
                        return `"${String(value).replace(/"/g, '""')}"`;
                    }).join(',')
                )
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `sub_signals_export_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert('Error downloading CSV file');
        }
    };

    return (
        <div className={styles.contentContainer}>
            {/* Stats Card */}
            <div className={styles.statsCard}>
                <div className={styles.statsNumber}>{subSignals.data.length}</div>
                <div className={styles.statsLabel}>Total Business Sub-Signals</div>
            </div>

            {/* Header with search and actions */}
            <div className={styles.listHeader}>
                <input name="searchsub-signals..." id="searchsub-signals..." type="text"
                    placeholder="Search sub-signals..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.searchBar}
                />
                <div className={styles.buttonGroup}>
                    <button 
                        onClick={downloadCSV}
                        className={styles.csvButton}
                        disabled={subSignals.data.length === 0}
                    >
                        📥 Download CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            {paginatedSubSignals.length === 0 ? (
                <div className={styles.emptyMessage}>
                    {searchTerm ? `No sub-signals found matching "${searchTerm}"` : 'No sub-signals available'}
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.tableHeader}>
                            <tr>
                                <th onClick={() => requestSort('subSignalName')} style={{ cursor: 'pointer' }}>
                                    Sub-Signal Name {sortConfig.key === 'subSignalName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                                </th>
                                <th onClick={() => requestSort('signal')} style={{ cursor: 'pointer' }}>
                                    Signal {sortConfig.key === 'signal' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                                </th>
                                <th>Comment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSubSignals.map((subSignal) => (
                                <tr key={subSignal._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>
                                        <div className={styles.subSignalName}>{subSignal.subSignalName}</div>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.signalName}>{findSignalName(subSignal.signalId)}</div>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.subSignalDescription}>{subSignal.generalComment}</div>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.actionButtons}>
                                            <button 
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                                onClick={() => handleEditClick(subSignal._id)} 
                                                disabled={userRole === 'User'}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleRemoveClick(subSignal._id, subSignal.subSignalName)} 
                                                disabled={userRole === 'User'}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages} ({sortedSubSignals.length} total sub-signals)
                    </span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
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
