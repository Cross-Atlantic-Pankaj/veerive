import { useState } from 'react';
import toast from 'react-hot-toast';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file, type, id) => {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!type || !id) {
      throw new Error('Type and ID are required');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          id,
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { presignedUrl, publicUrl } = await presignedResponse.json();
      setUploadProgress(25);

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      setUploadProgress(75);

      // Step 3: Update database with image URL
      const updateResponse = await fetch('/api/upload/image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          id,
          imageUrl: publicUrl,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update database');
      }

      setUploadProgress(100);
      toast.success('Image uploaded successfully!');
      
      return {
        success: true,
        imageUrl: publicUrl,
        data: await updateResponse.json(),
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = async (type, id, imageUrl) => {
    try {
      const response = await fetch('/api/upload/image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          id,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove image');
      }

      toast.success('Image removed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Remove error:', error);
      toast.error(error.message || 'Failed to remove image');
      throw error;
    }
  };

  return {
    uploadImage,
    removeImage,
    isUploading,
    uploadProgress,
  };
};
