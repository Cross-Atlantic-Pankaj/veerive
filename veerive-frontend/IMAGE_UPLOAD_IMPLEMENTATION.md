# Image Upload Implementation for Veerive

## Overview
This implementation adds image storage capabilities for contexts and posts in the Veerive application. Images are stored in AWS S3 and URLs are saved in MongoDB for efficient retrieval and rendering.

## Features Implemented

### 1. Database Schema Updates
- **Context Model**: Added `imageUrl` field to store AWS S3 image URLs
- **Post Model**: Added `imageUrl` field to store AWS S3 image URLs

### 2. Image Rendering Logic
- **Priority System**: Context/Post images take priority over tile templates
- **Fallback Chain**: Context image → Post image → Tile template → Placeholder
- **Error Handling**: Graceful fallback if images fail to load

### 3. Components Created

#### ContextImage Component (`src/components/ContextImage.js`)
- Reusable component for rendering images with fallback logic
- Supports both context and post images
- Handles image loading errors gracefully
- Configurable styling and fallback text

#### ImageUpload Component (`src/components/ImageUpload.js`)
- Drag-and-drop file upload interface
- File validation (type and size)
- Upload progress indication
- Image preview and management
- Remove image functionality

#### useImageUpload Hook (`src/hooks/useImageUpload.js`)
- Custom hook for image upload operations
- Handles presigned URL generation
- Manages upload progress
- Error handling and user feedback

### 4. API Endpoints

#### `/api/upload/image` (POST)
- Generates presigned URLs for direct S3 upload
- Validates file types and generates unique file keys
- Returns upload URL and public access URL

#### `/api/upload/image` (PUT)
- Updates database with image URL after successful upload
- Supports both context and post updates

#### `/api/upload/image` (DELETE)
- Removes image URL from database
- Optionally deletes file from S3
- Handles cleanup operations

### 5. Updated Components
All type components (TypeOne, TypeTwo, TypeThree, TypeFour, TypeFive) and the home page now use the new `ContextImage` component for consistent image rendering.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
```

### 2. Environment Variables
Add the following to your `.env.local` file:
```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

### 3. AWS S3 Bucket Setup
1. Create an S3 bucket in your AWS account
2. Configure bucket permissions for public read access
3. Set up CORS policy for web uploads
4. Note the bucket name and region

### 4. Database Migration
The new `imageUrl` fields are added to existing models. No migration is needed as they have default empty values.

## Usage Examples

### Using ImageUpload Component
```jsx
import ImageUpload from '../components/ImageUpload';

<ImageUpload
  type="context"
  id={contextId}
  currentImageUrl={context.imageUrl}
  onImageChange={(newUrl) => setContextImageUrl(newUrl)}
  className="w-64 h-48"
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

### Using ContextImage Component
```jsx
import ContextImage from '../components/ContextImage';

<ContextImage
  context={context}
  post={post}
  tileTemplate={tileTemplate}
  className="w-full h-48"
  fallbackText="No image available"
/>
```

### Using useImageUpload Hook
```jsx
import { useImageUpload } from '../hooks/useImageUpload';

const { uploadImage, removeImage, isUploading, uploadProgress } = useImageUpload();

// Upload image
const handleUpload = async (file) => {
  try {
    const result = await uploadImage(file, 'context', contextId);
    console.log('Upload successful:', result.imageUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## File Structure
```
src/
├── components/
│   ├── ContextImage.js      # Image rendering component
│   └── ImageUpload.js       # Upload interface component
├── hooks/
│   └── useImageUpload.js    # Upload logic hook
├── models/
│   ├── Context.js           # Updated with imageUrl field
│   └── Post.js              # Updated with imageUrl field
└── app/
    └── api/
        └── upload/
            └── image/
                └── route.js  # Upload API endpoints
```

## Security Considerations
- Presigned URLs expire after 1 hour
- File type validation on both client and server
- File size limits enforced
- S3 bucket permissions properly configured
- No direct database access from client

## Performance Optimizations
- Direct S3 uploads (no server bandwidth usage)
- Image URLs cached in database
- Lazy loading support
- Error handling prevents broken images
- Efficient fallback chain

## Future Enhancements
- Image resizing and optimization
- Multiple image support
- CDN integration
- Image compression
- Thumbnail generation
- Batch upload support

## Troubleshooting

### Common Issues
1. **AWS Credentials**: Ensure environment variables are correctly set
2. **S3 Permissions**: Check bucket policies and CORS configuration
3. **File Size**: Verify maxSize parameter matches server limits
4. **Network**: Check for CORS issues in browser console

### Debug Steps
1. Check browser network tab for failed requests
2. Verify AWS credentials and permissions
3. Test S3 bucket access independently
4. Check MongoDB connection and model updates
5. Validate file types and sizes

## Testing
- Test with various image formats (JPEG, PNG, WebP)
- Test file size limits
- Test error scenarios (network failures, invalid files)
- Test fallback behavior
- Test upload progress indication
- Test image removal functionality
