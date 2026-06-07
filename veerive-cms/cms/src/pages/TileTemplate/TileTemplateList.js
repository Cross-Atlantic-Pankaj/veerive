import React, { useContext, useState, useMemo, useEffect } from 'react';
import TileTemplateContext from '../../context/TileTemplateContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import JsxParser from 'react-jsx-parser';
import Tile from '../../components/Tile';
import styles from '../../html/css/TileTemplate.module.css';

const TileTemplateList = () => {
    const { tileTemplates, loading, initialLoading, deleteTileTemplate, fetchTileTemplates } = useContext(TileTemplateContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    
    const itemsPerPage = 10;

    // ✅ Load tile templates when TileTemplateList page is accessed
    useEffect(() => {
        if (fetchTileTemplates && tileTemplates.length === 0) {
            fetchTileTemplates();
        }
    }, [fetchTileTemplates, tileTemplates.length]);

    const handleDeleteClick = (id, templateName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Tile Template',
            message: `Are you sure you want to delete the template "${templateName}"? This action cannot be undone.`,
            onConfirm: () => handleDelete(id),
            itemToDelete: id
        });
    };

    const handleDelete = (id) => {
        try {
            deleteTileTemplate(id);
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleAddNew = () => {
        window.open('/tile-templates/new', '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
    };

    const handleEdit = (templateId) => {
        window.open(`/tile-templates/edit/${templateId}`, '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
    };
    
    // Filter and pagination logic
    const filteredTemplates = useMemo(() => {
        if (!tileTemplates || !Array.isArray(tileTemplates)) {
            return [];
        }
        return tileTemplates.filter(template => 
            template.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tileTemplates, searchTerm]);
    
    const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
    
    const paginatedTemplates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTemplates.slice(startIndex, endIndex);
    }, [filteredTemplates, currentPage, itemsPerPage]);
    
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
    
    // Reset to first page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Show initial loading spinner when first loading
    if (initialLoading) {
        return (
            <div className={styles.contentContainer}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Tile Templates</h1>
                </div>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Tile Templates</h1>
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
                }}>{tileTemplates?.length || 0}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Tile Templates</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <input name="searchtiletemplates..." id="searchtiletemplates..." type="text"
                    placeholder="Search tile templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                    disabled={loading}
                    style={{ flex: 1 }}
                />
                <button 
                    onClick={handleAddNew} 
                    className={styles.primaryButton}
                    disabled={loading}
                >
                    Add New Tile Template
                </button>
            </div>
            
            {loading && !initialLoading && (
                <div style={{ position: 'relative', minHeight: '200px' }}>
                    <LoadingSpinner />
                </div>
            )}
            
            {!loading && paginatedTemplates.length === 0 ? (
                <div className={styles.emptyMessage}>
                    {searchTerm ? `No templates found matching "${searchTerm}"` : 'No tile templates found'}
                </div>
            ) : !loading && (
                <>
                    <ul className={styles.tileGrid}>
                        {paginatedTemplates.map((template) => (
                            <li key={template._id} className={styles.tileTemplateItem}>
                                <div className={styles.itemHeader}>
                                    <h4 className={styles.itemTitle}>{template.name}</h4>
                                    <p className={styles.itemType}>Type: {template.type}</p>
                                </div>
                                <div 
                                    className={styles.tilePreview}
                                    style={{ backgroundColor: template.previewBackgroundColor || '#f8f9fa' }}
                                >
                                    <JsxParser
                                        jsx={template.jsxCode}
                                        components={{ Tile }}
                                        onError={(error) => console.error('JSX Parser Error:', error)}
                                    />
                                </div>
                                <div className={styles.tileActions}>
                                    <button 
                                        onClick={() => handleEdit(template._id)} 
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                        disabled={loading}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(template._id, template.name)} 
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button 
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || loading}
                                className={styles.paginationButton}
                            >
                                Previous
                            </button>
                            <span className={styles.pageInfo}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || loading}
                                className={styles.paginationButton}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
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
};

export default TileTemplateList; 