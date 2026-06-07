import React, { useContext, useState, useMemo, useEffect, useCallback } from 'react';
import CountryContext from '../../context/CountryContext';
import RegionContext from '../../context/RegionContext';
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from '../../html/css/Country.module.css';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

export default function CountryList() {
    const { countries, countriesDispatch, handleEditClick, handleAddClick, fetchCountries } = useContext(CountryContext);
    const { regions } = useContext(RegionContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const [sortConfig, setSortConfig] = useState({ key: 'countryName', direction: 'ascending' });
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const itemsPerPage = 10;

    // ✅ Load countries when CountryList page is accessed
    useEffect(() => {
        if (fetchCountries && countries.data.length === 0) {
            fetchCountries();
        }
    }, [fetchCountries, countries.data.length]);

    // ✅ Set loading to false when countries data is available
    useEffect(() => {
        if (countries.data.length > 0) {
            setLoading(false);
        }
    }, [countries.data.length]);

    const handleRemoveClick = (id, countryName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Country',
            message: `Are you sure you want to remove "${countryName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/countries/${id}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            countriesDispatch({ type: 'REMOVE_COUNTRY', payload: response.data._id });
            toast.success('Country removed successfully');
        } catch (err) {
            console.error('Error removing country:', err);
            toast.error('Failed to remove country');
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const findRegionName = useCallback((regionId) => {
        if (!regions?.data || regions.data.length === 0) {
            return 'Loading...';
        }
        const region = regions.data.find(r => r._id === regionId);
        return region ? region.regionName : 'Unknown Region';
    }, [regions]);

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

    const sortedCountries = useMemo(() => {
        if (!Array.isArray(countries.data) || countries.data.length === 0) {
            return [];
        }

        let sortableCountries = [...countries.data];

        if (sortConfig !== null) {
            sortableCountries.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'countryName':
                        aValue = normalizeForSorting(a.countryName);
                        bValue = normalizeForSorting(b.countryName);
                        break;
                    case 'region':
                        aValue = normalizeForSorting(findRegionName(a.regionId));
                        bValue = normalizeForSorting(findRegionName(b.regionId));
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

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return sortableCountries.filter(country => 
            country.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            findRegionName(country.regionId).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (country.generalComment || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [countries, sortConfig, searchQuery, findRegionName]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedCountries.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedCountries = sortedCountries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

    const handleDownloadCSV = () => {
        const csvData = sortedCountries.map(country => ({
            'Country Name': country.countryName || '',
            'Region Name': findRegionName(country.regionId),
            'General Comment': country.generalComment || '',
            'Created At': country.createdAt ? new Date(country.createdAt).toLocaleDateString() : '',
            'Updated At': country.updatedAt ? new Date(country.updatedAt).toLocaleDateString() : ''
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `countries_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading countries...</p>
            </div>
        );
    }

    if (!countries?.data || !regions?.data) {
        return <div className={styles.emptyMessage}>Failed to load data</div>;
    }

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2>Country List</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Country
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
                }}>{countries.data.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Countries</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchcountries..." id="searchcountries..." type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('countryName')}>
                                Country Name {sortConfig.key === 'countryName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('region')}>
                                Region {sortConfig.key === 'region' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th onClick={() => requestSort('generalComment')}>
                                General Comment {sortConfig.key === 'generalComment' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCountries.length === 0 ? (
                            <tr>
                                <td colSpan="4" className={styles.emptyMessage}>
                                    {searchQuery.trim() ? 'No countries found matching your search' : 'No countries found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedCountries.map((country) => (
                                <tr key={country._id}>
                                    <td>{country.countryName || "N/A"}</td>
                                    <td>{findRegionName(country.regionId) || "N/A"}</td>
                                    <td>{country.generalComment || "N/A"}</td>
                                    <td>
                                        <button
                                            className={`${styles.actionButton} ${styles.editButton}`}
                                            onClick={() => navigate(`/countries/edit/${country._id}`)}
                                            disabled={userRole === 'User'}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            onClick={() => handleRemoveClick(country._id, country.countryName)}
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
                        <span>Page {currentPage} of {totalPages} ({sortedCountries.length} total items)</span>
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
