import React, { useContext, useState, useEffect } from 'react'; // Import React and hooks from React
import CompanyContext from '../../context/CompanyContext'; // Import CompanyContext for managing company-related state
import CountryContext from '../../context/CountryContext'; // Import CountryContext for country data
import SectorContext from '../../context/SectorContext'; // Import SectorContext for sector data
import SubSectorContext from '../../context/SubSectorContext'; // Import SubSectorContext for sub-sector data
import axios from '../../config/axios'; // Import axios instance for making HTTP requests
import styles from '../../html/css/Company.module.css'; // Import CSS modules for styling the CompanyList component
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import Papa from 'papaparse';

export default function CompanyList() {
    // Use CompanyContext to access context values and dispatch actions
    const { companies, companiesDispatch, handleAddClick, handleEditClick, fetchCompanies, countries, sectors, subSectors, state } = useContext(CompanyContext);
    const { state: authState } = useContext(AuthContext);
    
    // Get fetch functions from dependency contexts
    const { fetchCountries } = useContext(CountryContext);
    const { fetchSectors } = useContext(SectorContext);
    const { fetchSubSectors } = useContext(SubSectorContext);
    const userRole = authState.user?.role;

    // State variables for search query, sorting column, and sorting order
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('companyName');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for ascending, 'desc' for descending
    const [page, setPage] = useState(1);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const itemsPerPage = 10;

    // ✅ Load companies and dependencies when CompanyList page is accessed
    useEffect(() => {
        if (fetchCompanies && companies.data.length === 0) {
            fetchCompanies();
        }
        if (fetchCountries && countries.data.length === 0) {
            fetchCountries(); // Load countries for dropdown
        }
        if (fetchSectors && sectors.data.length === 0) {
            fetchSectors(); // Load sectors for dropdown
        }
        if (fetchSubSectors && subSectors.data.length === 0) {
            fetchSubSectors(); // Load sub-sectors for dropdown
        }
    }, [fetchCompanies, companies.data.length, fetchCountries, countries.data.length, fetchSectors, sectors.data.length, fetchSubSectors, subSectors.data.length]);

    // Helper function to normalize text for sorting (remove non-letters, convert to lowercase)
    const normalizeForSorting = (text) => {
        if (!text) return '';
        return String(text).replace(/[^a-zA-Z]/g, '').toLowerCase();
    };

    // Helper function to get country name by ID
    const getCountryName = (id, data) => {
        const item = data.find(ele => ele._id === id); // Find the country item by ID
        return item ? item.countryName : 'N/A'; // Return country name or 'N/A' if not found
    };

    // Helper function to get sector names by array of sector IDs
    const getSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if ids is not an array
        const sectorNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the sector item by ID
            return item ? item.sectorName : 'Unknown'; // Return sector name or 'Unknown' if not found
        });
        return sectorNames.join(', '); // Join sector names with commas
    };

    // Helper function to get sub-sector names by array of sub-sector IDs
    const getSubSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if ids is not an array
        const subSectorNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the sub-sector item by ID
            return item ? item.subSectorName : 'Unknown'; // Return sub-sector name or 'Unknown' if not found
        });
        return subSectorNames.join(', '); // Join sub-sector names with commas
    };

    // Filter companies based on the search query
    const filteredCompanies = companies.data.filter(company =>
        (company.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by company name
        (company.parentName || '').toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by parent name
        (company.website || '').toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by website
        getCountryName(company.country, countries.data).toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by country name
        getSectorNames(company.sectors, sectors.data).toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by sector names
        getSubSectorNames(company.subSectors, subSectors.data).toLowerCase().includes(searchQuery.toLowerCase()) // Filter by sub-sector names
    );

    // Sort the filtered companies based on the selected column and order
    const sortedCompanies = [...filteredCompanies].sort((a, b) => {
        let aValue, bValue;

        // Get values based on sort column with proper normalization
        switch (sortColumn) {
            case 'companyName':
                aValue = normalizeForSorting(a.companyName);
                bValue = normalizeForSorting(b.companyName);
                break;
            case 'parentName':
                aValue = normalizeForSorting(a.parentName);
                bValue = normalizeForSorting(b.parentName);
                break;
            case 'website':
                aValue = normalizeForSorting(a.website);
                bValue = normalizeForSorting(b.website);
                break;
            case 'country':
                aValue = normalizeForSorting(getCountryName(a.country, countries.data));
                bValue = normalizeForSorting(getCountryName(b.country, countries.data));
                break;
            case 'sectors':
                aValue = normalizeForSorting(getSectorNames(a.sectors, sectors.data));
                bValue = normalizeForSorting(getSectorNames(b.sectors, sectors.data));
                break;
            case 'subSectors':
                aValue = normalizeForSorting(getSubSectorNames(a.subSectors, subSectors.data));
                bValue = normalizeForSorting(getSubSectorNames(b.subSectors, subSectors.data));
                break;
            case 'generalComment':
                aValue = normalizeForSorting(a.generalComment);
                bValue = normalizeForSorting(b.generalComment);
                break;
            default:
                aValue = normalizeForSorting(a[sortColumn]);
                bValue = normalizeForSorting(b[sortColumn]);
                break;
        }

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // String comparison for normalized text
        let comparison = 0;
        if (aValue < bValue) {
            comparison = -1;
        } else if (aValue > bValue) {
            comparison = 1;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedCompanies.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedCompanies = sortedCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handle sorting when a column header is clicked
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order if column is the same
        } else {
            setSortColumn(column); // Set new sort column
            setSortOrder('asc'); // Reset sort order to ascending
        }
    };

    // Handle company removal
    const handleRemoveClick = (id, companyName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Company',
            message: `Are you sure you want to remove "${companyName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/companies/${id}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }); // Make API request to delete company
            companiesDispatch({ type: 'REMOVE_COMPANY', payload: response.data._id }); // Dispatch action to remove company from context
        } catch (err) {
            alert(err.message); // Show error message if deletion fails
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleDownloadCSV = () => {
        const csvData = companies.data.map(company => ({
            ...company,
            sectors: (company.sectors || []).map(id => {
                const sector = sectors.data.find(s => s._id === id);
                return sector ? sector.sectorName : id;
            }).join(', '),
            subSectors: (company.subSectors || []).map(id => {
                const subSector = subSectors.data.find(s => s._id === id);
                return subSector ? subSector.subSectorName : id;
            }).join(', '),
            country: (() => {
                const country = countries.data.find(c => c._id === company.country);
                return country ? country.countryName : company.country;
            })(),
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'companies.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                <h2>Companies Master</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>Add Company</button>
                    <button className={styles.primaryButton} onClick={handleDownloadCSV}>Download CSV</button>
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
                }}>{companies.data.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Companies</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchcompanies..." id="searchcompanies..." type="text"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('companyName')}>Company Name {sortColumn === 'companyName' && (sortOrder === 'asc' ? '🔼' : '🔽')}</th>
                            <th onClick={() => handleSort('parentName')}>Parent Name {sortColumn === 'parentName' && (sortOrder === 'asc' ? '🔼' : '🔽')}</th>
                            <th onClick={() => handleSort('website')}>Website {sortColumn === 'website' && (sortOrder === 'asc' ? '🔼' : '🔽')}</th>
                            <th onClick={() => handleSort('country')}>Country {sortColumn === 'country' && (sortOrder === 'asc' ? '🔼' : '🔽')}</th>
                            <th onClick={() => handleSort('sectors')}>Sectors {sortColumn === 'sectors' && (sortOrder === 'asc' ? '🔼' : '🔽')}</th>
                            <th onClick={() => handleSort('subSectors')}>Sub-Sectors {sortColumn === 'subSectors' && (sortOrder === 'asc' ? '🔼' : '🔽')}</th>
                            <th onClick={() => handleSort('generalComment')}>General Comment {sortColumn === 'generalComment' && (sortOrder === 'asc' ? '🔼' : '🔽')}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCompanies.length === 0 ? (
                            <tr>
                                <td colSpan="8" className={styles.emptyMessage}>
                                    {searchQuery.trim() ? 'No companies found matching your search' : 'No companies found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedCompanies.map(ele => (
                                <tr key={ele._id}>
                                    <td>{ele.companyName}</td>
                                    <td>{ele.parentName}</td>
                                    <td>{ele.website}</td>
                                    <td>{getCountryName(ele.country, countries.data)}</td>
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
                                            onClick={() => handleRemoveClick(ele._id, ele.companyName)} 
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
                        <span>Page {currentPage} of {totalPages} ({sortedCompanies.length} total items)</span>
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
