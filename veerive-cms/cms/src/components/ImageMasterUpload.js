import React, { useState } from 'react';
import axios from '../config/axios';
import styles from '../html/css/Theme.module.css';

const ImageMasterUpload = ({ 
    label = "Upload Image", 
    currentImageUrl = "", 
    onImageUpload, 
    onImageDelete 
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post('/api/admin/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                onImageUpload(response.data.data.imageUrl);
                setError('');
            } else {
                setError(response.data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = () => {
        onImageDelete();
        setError('');
    };

    return (
        <div className="form-group">
            <label><b>{label}</b></label>
            
            {currentImageUrl ? (
                <div style={{ marginBottom: '10px' }}>
                    <img 
                        src={currentImageUrl} 
                        alt="Current" 
                        style={{ 
                            width: '100px', 
                            height: '100px', 
                            objectFit: 'cover',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }} 
                    />
                    <div style={{ marginTop: '5px' }}>
                        <button 
                            type="button" 
                            onClick={handleDelete}
                            style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Remove Image
                        </button>
                    </div>
                </div>
            ) : null}

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}
            />

            {uploading && (
                <div style={{ 
                    marginTop: '5px', 
                    color: '#007bff', 
                    fontSize: '14px' 
                }}>
                    Uploading...
                </div>
            )}

            {error && (
                <div style={{ 
                    marginTop: '5px', 
                    color: '#dc3545', 
                    fontSize: '14px' 
                }}>
                    {error}
                </div>
            )}

            <div style={{ 
                marginTop: '5px', 
                fontSize: '12px', 
                color: '#666' 
            }}>
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
            </div>
        </div>
    );
};

export default ImageMasterUpload;
