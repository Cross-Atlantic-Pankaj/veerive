import React, { useContext, useState, useEffect } from 'react';
import ImageContext from '../../context/ImageContext';
import styles from '../../html/css/Theme.module.css';
import ImageMasterUpload from '../../components/ImageMasterUpload';
import axios from '../../config/axios';

const ImageForm = ({ handleFormSubmit }) => {
    const { images, setIsFormVisible } = useContext(ImageContext);
    const [formData, setFormData] = useState({
        imageTitle: '',
        imageLink: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (images.editId) {
            // Find the image to edit
            const imageToEdit = images.allImages?.find(img => img._id === images.editId);
            if (imageToEdit) {
                setFormData({
                    imageTitle: imageToEdit.imageTitle || '',
                    imageLink: imageToEdit.imageLink || ''
                });
            }
        } else {
            // Reset form for new image
            setFormData({
                imageTitle: '',
                imageLink: ''
            });
        }
    }, [images.editId, images.allImages]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await handleFormSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save image');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsFormVisible(false);
    };

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2 style={{ fontSize: '1.5rem' }}>
                    {images.editId ? 'Edit Image' : 'Add New Image'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.companyForm}>
                <div className="form-group">
                    <label><b>Image Title</b> <span style={{color:'red'}}>*</span></label>
                    <input 
                        type="text" 
                        className="theme-input" 
                        name="imageTitle"
                        value={formData.imageTitle} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>

                <ImageMasterUpload
                    label="Upload Image"
                    currentImageUrl={formData.imageLink}
                    onImageUpload={(url) => setFormData(prev => ({ ...prev, imageLink: url }))}
                    onImageDelete={() => setFormData(prev => ({ ...prev, imageLink: '' }))}
                />

                {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

                <div className={styles.buttonGroup}>
                    <button 
                        type="submit" 
                        className={styles.companySubmitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (images.editId ? 'Update Image' : 'Save Image')}
                    </button>
                    <button 
                        type="button" 
                        className={styles.companyCancelBtn}
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImageForm;
