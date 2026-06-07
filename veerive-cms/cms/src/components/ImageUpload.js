import React, { useState } from 'react';
import axios from '../config/axios';
import './ImageUpload.css';

const ImageUpload = ({ 
  onImageUpload, 
  currentImageUrl, 
  onImageDelete, 
  disabled = false,
  label = "Upload Image",
  acceptedTypes = "image/*"
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        const imageUrl = response.data.data.imageUrl;
        setPreview(imageUrl);
        onImageUpload(imageUrl);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setError(error.response?.data?.message || error.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    try {
      await axios.delete('/api/images/delete', {
        data: { imageUrl: currentImageUrl },
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      
      setPreview(null);
      onImageDelete();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete image');
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    onImageDelete();
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">{label}</label>
      
      <div className="image-upload-area">
        {preview ? (
          <div className="image-preview-container">
            <img 
              src={preview} 
              alt="Preview" 
              className="image-preview"
            />
            <div className="image-preview-actions">
              <button
                type="button"
                onClick={handleRemovePreview}
                className="btn-remove"
                disabled={disabled}
              >
                Remove
              </button>
              {currentImageUrl && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-delete"
                  disabled={disabled}
                >
                  Delete from Server
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="image-upload-placeholder">
            <div className="upload-icon">📷</div>
            <p>Click to upload image</p>
            <p className="upload-hint">Supports: JPEG, PNG, GIF, WebP (Max 5MB)</p>
          </div>
        )}
        
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="image-upload-input"
          id="image-upload"
        />
        
        <label 
          htmlFor="image-upload" 
          className={`image-upload-button ${disabled || uploading ? 'disabled' : ''}`}
        >
          {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Select Image'}
        </label>
      </div>

      {error && (
        <div className="image-upload-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
