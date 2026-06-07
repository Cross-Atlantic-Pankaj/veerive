import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS S3 (only if credentials are provided)
let s3Client = null;

if (process.env.AWS_ACCESS_KEY_ID && 
    process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key_here' &&
    process.env.AWS_SECRET_ACCESS_KEY && 
    process.env.AWS_SECRET_ACCESS_KEY !== 'your_aws_secret_key_here') {
  try {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  } catch (error) {
    console.error('Error configuring AWS S3:', error);
  }
}

// Configure multer for S3 upload (only if S3 is available)
let upload;
if (s3Client) {
  upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = `images/${file.fieldname}-${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, { 
          fieldName: file.fieldname,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        });
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
      }
    }
  });
} else {
  // Fallback to memory storage when S3 is not available
  upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
      }
    }
  });
}

// Middleware for single image upload
export const uploadSingleImage = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple image uploads
export const uploadMultipleImages = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Function to delete image from S3
export const deleteImageFromS3 = async (imageUrl) => {
  if (!s3Client) {
    return { success: false, message: 'AWS S3 not configured' };
  }
  
  try {
    // Extract key from URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    });

    await s3Client.send(deleteCommand);
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return { success: false, message: 'Error deleting image', error: error.message };
  }
};

// Function to get image URL from S3 upload result
export const getImageUrl = (uploadResult) => {
  if (uploadResult && uploadResult.location) {
    return uploadResult.location;
  }
  return null;
};

// Specialized upload for Images master page - saves to dedicated directory
export const uploadImageForMaster = multer({
  storage: s3Client ? multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const fileName = `master-images/${file.fieldname}-${uniqueSuffix}${fileExtension}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { 
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
        source: 'images-master'
      });
    }
  }) : multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
    }
  }
});

// Middleware for single image upload for Images master
export const uploadSingleImageForMaster = (fieldName) => {
  return (req, res, next) => {
    uploadImageForMaster.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error('Multer error for master image:', err);
        return next(err);
      }
      next();
    });
  };
};

// ===== PPT Upload Support =====
// Separate multer instance for PPT/PPTX uploads
export const uploadPpt = multer({
  storage: s3Client ? multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const fileName = `ppt/${file.fieldname}-${uniqueSuffix}${fileExtension}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
        type: 'ppt'
      });
    }
  }) : multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: function (req, file, cb) {
    const allowedMime = /vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation/;
    const allowedExt = /\.ppt$|\.pptx$/i;
    const extname = allowedExt.test(path.extname(file.originalname));
    const mimetype = allowedMime.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PPT/PPTX files are allowed!'));
    }
  }
});

export const uploadSinglePpt = (fieldName) => {
  return (req, res, next) => {
    uploadPpt.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error('Multer error for PPT upload:', err);
        return next(err);
      }
      next();
    });
  };
};

export default upload;
