// pages/Signal/SignalList.js
import React, { useContext, useState, useMemo, useEffect } from 'react';
import SignalContext from '../../context/SignalContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import axios from '../../config/axios';
import AuthContext from '../../context/AuthContext';
import styles from '../../html/css/Signal.module.css';

export default function SignalList() {
    const { signals, signalsDispatch, handleEditClick, fetchSignals } = useContext(SignalContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });

    // ✅ Load signals when SignalList page is accessed
    useEffect(() => {
        if (fetchSignals && signals.data.length === 0) {
            fetchSignals();
        }
    }, [fetchSignals, signals.data.length]);

    const handleRemoveClick = (id, signalName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Signal',
            message: `Are you sure you want to remove "${signalName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/signals/${id}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
            signalsDispatch({ type: 'REMOVE_SIGNAL', payload: response.data._id });
        } catch (err) {
            alert(err.message);
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    // Filter and paginate signals
    const filteredSignals = useMemo(() => {
        if (!searchTerm.trim()) return signals.data;
        return signals.data.filter(signal =>
            signal.signalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            signal.generalComment?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [signals.data, searchTerm]);

    const paginatedSignals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSignals.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSignals, currentPage]);

    const totalPages = Math.ceil(filteredSignals.length / itemsPerPage);

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
            const csvData = signals.data.map(signal => ({
                'Signal Name': signal.signalName || '',
                'General Comment': signal.generalComment || '',
                'Created At': signal.createdAt ? new Date(signal.createdAt).toLocaleDateString() : '',
                'Updated At': signal.updatedAt ? new Date(signal.updatedAt).toLocaleDateString() : ''
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
            link.setAttribute('download', `signals_export_${new Date().toISOString().slice(0, 10)}.csv`);
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
                <div className={styles.statsNumber}>{signals.data.length}</div>
                <div className={styles.statsLabel}>Total Business Signals</div>
            </div>

            {/* Header with search and actions */}
            <div className={styles.listHeader}>
                <input name="searchsignals..." id="searchsignals..." type="text"
                    placeholder="Search signals..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.searchBar}
                />
                <div className={styles.buttonGroup}>
                    <button 
                        onClick={downloadCSV}
                        className={styles.csvButton}
                        disabled={signals.data.length === 0}
                    >
                        📥 Download CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            {paginatedSignals.length === 0 ? (
                <div className={styles.emptyMessage}>
                    {searchTerm ? `No signals found matching "${searchTerm}"` : 'No signals available'}
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.tableHeader}>
                            <tr>
                                <th>Signal Name</th>
                                <th>General Comment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSignals.map((signal) => (
                                <tr key={signal._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>
                                        <div className={styles.signalName}>{signal.signalName}</div>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.signalDescription}>{signal.generalComment}</div>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.actionButtons}>
                                            <button 
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                                onClick={() => handleEditClick(signal._id)} 
                                                disabled={userRole === 'User'}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleRemoveClick(signal._id, signal.signalName)} 
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
                        Page {currentPage} of {totalPages} ({filteredSignals.length} total signals)
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
