import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check Context schema
const checkContextSchema = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('contexts');
    
    // Get a sample document
    const sampleDoc = await collection.findOne({});
    if (sampleDoc) {
      console.log('\n=== Context Collection Fields ===');
      console.log('Available fields:', Object.keys(sampleDoc));
      console.log('Has imageUrl field:', 'imageUrl' in sampleDoc);
      if ('imageUrl' in sampleDoc) {
        console.log('imageUrl value:', sampleDoc.imageUrl);
      }
    } else {
      console.log('No documents found in contexts collection');
    }
  } catch (error) {
    console.error('Error checking Context schema:', error);
  }
};

// Check Post schema
const checkPostSchema = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('posts');
    
    // Get a sample document
    const sampleDoc = await collection.findOne({});
    if (sampleDoc) {
      console.log('\n=== Post Collection Fields ===');
      console.log('Available fields:', Object.keys(sampleDoc));
      console.log('Has imageUrl field:', 'imageUrl' in sampleDoc);
      if ('imageUrl' in sampleDoc) {
        console.log('imageUrl value:', sampleDoc.imageUrl);
      }
    } else {
      console.log('No documents found in posts collection');
    }
  } catch (error) {
    console.error('Error checking Post schema:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  await checkContextSchema();
  await checkPostSchema();
  
  console.log('\n=== Schema Check Complete ===');
  process.exit(0);
};

main().catch(console.error);
