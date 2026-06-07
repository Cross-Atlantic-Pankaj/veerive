import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import ImageContext from '../../context/ImageContext';
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from '../../html/css/Theme.module.css';
import axios from '../../config/axios';
import ImageForm from './ImageForm';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function normalizeString(str) {
    if (!str) return '';
    return String(str).replace(/[^a-zA-Z]/g, '').toLowerCase();
}

export default function ImageList() {
    const { 
        images, 
        imagesDispatch, 
        fetchImages,
        fetchAllImages,
        fetchImagesPageData, 
        handleAddClick, 
        handleEditClick, 
        currentPage, 
        setCurrentPage,
        isFormVisible,
        setIsFormVisible,
        handleFormSubmit
    } = useContext(ImageContext);

    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;

    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'imageTitle', direction: 'ascending' });
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
        fetchImagesPageData();
    }, []);

    useEffect(() => {
        if (images.editId) {
            setIsFormVisible(true);
        }
    }, [images.editId, setIsFormVisible]);

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

    // Always use allImages for sorting/searching/pagination
    const sortedImages = useMemo(() => {
        let sortableImages = [...(images.allImages || [])];
        if (sortConfig !== null) {
            sortableImages.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'imageTitle':
                        aValue = normalizeString(a.imageTitle);
                        bValue = normalizeString(b.imageTitle);
                        break;
                    case 'imageLink':
                        aValue = normalizeString(a.imageLink);
                        bValue = normalizeString(b.imageLink);
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
        return sortableImages;
    }, [images.allImages, sortConfig]);
    
    // Search on allImages
    const filteredImages = useMemo(() => {
        return sortedImages.filter(image =>
            (image.imageTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedImages, searchQuery]);

    // Pagination on filteredImages
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(filteredImages.length / itemsPerPage));
    const currentPageSafe = Math.min(currentPage, totalPages);
    const paginatedImages = filteredImages.slice((currentPageSafe - 1) * itemsPerPage, currentPageSafe * itemsPerPage);

    const handleDeleteClick = (id, imageTitle) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Image',
            message: `Are you sure you want to remove "${imageTitle}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/images/${id}`, { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
            });
            
            if (response.data.success) {
                toast.success(response.data.message || 'Image deleted successfully!');
                await fetchImagesPageData();
            } else {
                toast.error('Failed to delete image');
            }
        } catch (err) {
            console.error('Error deleting image:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete image';
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
                'Image Title'
            ];

            const csvData = filteredImages.map(image => [
                image.imageTitle || ''
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
            link.setAttribute('download', `images_${new Date().toISOString().split('T')[0]}.csv`);
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
                <ImageForm handleFormSubmit={handleFormSubmit} />
            </div>
        );
    }

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2 style={{ fontSize: '1.5rem' }}>Images Master</h2>
                <div className={styles.headerActions}>
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Image
                    </button>
                    <button className={styles.primaryButton} onClick={downloadCSV}>
                        📥 Download CSV
                    </button>
                </div>
            </div>

            {/* Stats Card */}
            <div className={styles.statsCard}>
                <div className={styles.statsNumber}>{images.allImages?.length || 0}</div>
                <div className={styles.statsLabel}>Total Images</div>
            </div>
            
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <input name="searchimages..." id="searchimages..." type="text"
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('imageTitle')}>
                                Image Title {sortConfig.key === 'imageTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                            </th>
                            <th>Preview</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedImages.length === 0 ? (
                            <tr>
                                <td colSpan="3" className={styles.emptyMessage}>
                                    {searchQuery.trim() ? 'No images found matching your search' : 'No images found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedImages.map(image => (
                                <tr key={image._id}>
                                    <td>{image.imageTitle}</td>
                                    <td>{image.imageLink ? <img src={image.imageLink} alt={image.imageTitle} style={{ width: 40, height: 40, objectFit: 'contain' }} /> : '—'}</td>
                                    <td>
                                        <button 
                                            className={`${styles.actionButton} ${styles.editButton}`} 
                                            onClick={() => handleEditClick(image._id)} 
                                            disabled={userRole === 'User'}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.deleteButton}`} 
                                            onClick={() => handleDeleteClick(image._id, image.imageTitle)} 
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
                        <span>Page {currentPageSafe} of {totalPages} ({filteredImages.length} total items)</span>
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
