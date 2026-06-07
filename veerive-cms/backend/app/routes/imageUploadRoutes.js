import express from 'express';
import { uploadImage, deleteImage, handleImageUploadError, uploadPpt } from '../controllers/imageUploadController.js';
import { uploadSingleImage, uploadSinglePpt } from '../../utils/s3Upload.js';
import { authenticateUser } from '../middlewares/authenticateUser.js';

const router = express.Router();

// Upload single image route
router.post('/upload', 
  authenticateUser, 
  uploadSingleImage('image'), 
  uploadImage, 
  handleImageUploadError
);

// Upload single PPT route
router.post('/upload-ppt',
  authenticateUser,
  uploadSinglePpt('ppt'),
  uploadPpt,
  handleImageUploadError
);

// Delete image route
router.delete('/delete', 
  authenticateUser, 
  deleteImage
);

export default router;
