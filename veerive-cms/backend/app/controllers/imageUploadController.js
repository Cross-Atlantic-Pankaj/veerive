import { uploadSingleImage, getImageUrl, deleteImageFromS3, uploadSinglePpt } from '../../utils/s3Upload.js';
import multer from 'multer';

// Upload single image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check if AWS S3 is configured
    const awsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key_here' &&
                         process.env.AWS_SECRET_ACCESS_KEY && 
                         process.env.AWS_SECRET_ACCESS_KEY !== 'your_aws_secret_key_here';
    
    if (!awsConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Image upload service not configured. Please configure AWS S3 credentials.'
      });
    }

    const imageUrl = getImageUrl(req.file);
    
    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get image URL from upload'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: imageUrl,
        location: req.file.location,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        s3Key: req.file.key,
        s3Bucket: req.file.bucket
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Upload PPT
export const uploadPpt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PPT file provided' });
    }

    const awsConfigured = process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key_here' &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_SECRET_ACCESS_KEY !== 'your_aws_secret_key_here';

    if (!awsConfigured) {
      return res.status(503).json({ success: false, message: 'Upload service not configured. Please configure AWS S3 credentials.' });
    }

    const pptUrl = req.file.location || null;
    if (!pptUrl) {
      return res.status(500).json({ success: false, message: 'Failed to get PPT URL from upload' });
    }

    res.status(200).json({
      success: true,
      message: 'PPT uploaded successfully',
      data: {
        pptUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        s3Key: req.file.key,
        s3Bucket: req.file.bucket,
      }
    });
  } catch (error) {
    console.error('PPT upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading PPT', error: error.message });
  }
};

// Delete image
export const deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const result = await deleteImageFromS3(imageUrl);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// Middleware for handling image upload errors
export const handleImageUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error processing image upload',
    error: error.message
  });
};
