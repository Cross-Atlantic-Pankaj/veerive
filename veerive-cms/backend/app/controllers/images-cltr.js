import Image from '../models/image-model.js'
import { deleteImageFromS3, uploadSingleImageForMaster, getImageUrl } from '../../utils/s3Upload.js'

const imagesCltr = {}

imagesCltr.list = async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 })
        res.json({ success: true, data: images })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch images', error: err.message })
    }
}

imagesCltr.create = async (req, res) => {
    try {
        const { imageTitle, imageLink } = req.body
        if (!imageTitle || !imageLink) {
            return res.status(400).json({ success: false, message: 'imageTitle and imageLink are required' })
        }
        const image = new Image({ imageTitle, imageLink })
        await image.save()
        res.status(201).json({ success: true, data: image })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create image', error: err.message })
    }
}

imagesCltr.update = async (req, res) => {
    try {
        const { id } = req.params
        const { imageTitle, imageLink } = req.body
        
        if (!imageTitle || !imageLink) {
            return res.status(400).json({ success: false, message: 'imageTitle and imageLink are required' })
        }
        
        const image = await Image.findByIdAndUpdate(
            id, 
            { imageTitle, imageLink }, 
            { new: true, runValidators: true }
        )
        
        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' })
        }
        
        res.json({ success: true, data: image })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update image', error: err.message })
    }
}

imagesCltr.delete = async (req, res) => {
    try {
        const { id } = req.params
        const image = await Image.findById(id)
        
        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' })
        }
        
        // Delete from S3 if it's an S3 URL
        if (image.imageLink && image.imageLink.includes('amazonaws.com')) {
            const deleteResult = await deleteImageFromS3(image.imageLink)
            if (!deleteResult.success) {
                console.warn('Failed to delete image from S3:', deleteResult.message)
            }
        }
        
        // Delete from database
        await Image.findByIdAndDelete(id)
        
        res.json({ success: true, message: 'Image deleted successfully' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete image', error: err.message })
    }
}

// Upload image for Images master page
imagesCltr.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Get the S3 URL
        const imageUrl = getImageUrl(req.file);
        
        if (!imageUrl) {
            return res.status(500).json({
                success: false,
                message: 'Failed to get image URL'
            });
        }

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl: imageUrl,
                originalName: req.file.originalname,
                size: req.file.size,
                uploadedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error uploading image for master:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
}

export default imagesCltr


