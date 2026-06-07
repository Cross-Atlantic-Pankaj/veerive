import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Context from '../../../../models/Context';
import Post from '../../../../models/Post';
import Theme from '../../../../models/Theme';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Generate presigned URL for direct upload
export async function POST(request) {
  try {
    const { type, id, fileName, contentType } = await request.json();

    if (!type || !id || !fileName || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: type, id, fileName, contentType' },
        { status: 400 }
      );
    }

    if (!['context', 'post', 'theme'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "context", "post", or "theme"' },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${type}s/${id}/${uuidv4()}.${fileExtension}`;

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: contentType,
      ACL: 'public-read', // Make the file publicly accessible
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      presignedUrl,
      fileKey: uniqueFileName,
      publicUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

// Update database with image URL after successful upload
export async function PUT(request) {
  try {
    const { type, id, imageUrl } = await request.json();

    if (!type || !id || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: type, id, imageUrl' },
        { status: 400 }
      );
    }

    await connectDB();

    let result;
    if (type === 'context') {
      result = await Context.findByIdAndUpdate(
        id,
        { imageUrl },
        { new: true }
      );
    } else if (type === 'post') {
      result = await Post.findByIdAndUpdate(
        id,
        { imageUrl },
        { new: true }
      );
    } else if (type === 'theme') {
      result = await Theme.findByIdAndUpdate(
        id,
        { imageUrl },
        { new: true }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: `${type} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type} image updated successfully`,
      data: result,
    });
  } catch (error) {
    console.error('Error updating image URL:', error);
    return NextResponse.json(
      { error: 'Failed to update image URL' },
      { status: 500 }
    );
  }
}

// Delete image from S3 and remove URL from database
export async function DELETE(request) {
  try {
    const { type, id, imageUrl } = await request.json();

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing required fields: type, id' },
        { status: 400 }
      );
    }

    await connectDB();

    // Remove image URL from database
    let result;
    if (type === 'context') {
      result = await Context.findByIdAndUpdate(
        id,
        { $unset: { imageUrl: 1 } },
        { new: true }
      );
    } else if (type === 'post') {
      result = await Post.findByIdAndUpdate(
        id,
        { $unset: { imageUrl: 1 } },
        { new: true }
      );
    } else if (type === 'theme') {
      result = await Theme.findByIdAndUpdate(
        id,
        { $unset: { imageUrl: 1 } },
        { new: true }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: `${type} not found` },
        { status: 404 }
      );
    }

    // If imageUrl is provided, delete from S3
    if (imageUrl) {
      try {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        const fileKey = imageUrl.split('.com/')[1]; // Extract key from URL
        
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileKey,
        });

        await s3Client.send(deleteCommand);
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
        // Continue even if S3 deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `${type} image removed successfully`,
    });
  } catch (error) {
    console.error('Error removing image:', error);
    return NextResponse.json(
      { error: 'Failed to remove image' },
      { status: 500 }
    );
  }
}
