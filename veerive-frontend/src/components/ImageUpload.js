import React, { useState, useRef } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import * as LucideIcons from 'lucide-react';

const ImageUpload = ({ 
  type, 
  id, 
  currentImageUrl, 
  onImageChange, 
  className = "w-full h-full",
  showPreview = true,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  children 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadImage, removeImage, isUploading, uploadProgress } = useImageUpload();

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    try {
      const result = await uploadImage(file, type, id);
      if (result.success && onImageChange) {
        onImageChange(result.imageUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    try {
      await removeImage(type, id, currentImageUrl);
      if (onImageChange) {
        onImageChange(null);
      }
    } catch (error) {
      console.error('Remove failed:', error);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

      {showPreview && currentImageUrl ? (
        <div className="relative group">
          <img
            src={currentImageUrl}
            alt="Uploaded image"
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback if image fails to load */}
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
            <div className="text-gray-400 text-sm">Image failed to load</div>
          </div>
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={openFileDialog}
                disabled={isUploading}
                className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                Change
              </button>
              <button
                onClick={handleRemove}
                disabled={isUploading}
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">Uploading... {uploadProgress}%</div>
            </div>
          ) : (
            <div className="text-center">
              <LucideIcons.Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {dragActive ? 'Drop image here' : 'Click or drag to upload'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Max {Math.round(maxSize / 1024 / 1024)}MB
              </div>
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default ImageUpload;
