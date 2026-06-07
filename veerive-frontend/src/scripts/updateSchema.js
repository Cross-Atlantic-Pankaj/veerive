import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theme from '../models/Theme.js';

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

// Update Context schema
const updateContextSchema = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('contexts');
    
    // Check if imageUrl field exists in any document
    const sampleDoc = await collection.findOne({});
    console.log('Sample Context document fields:', Object.keys(sampleDoc || {}));
    
    // Add imageUrl field to all documents that don't have it
    const result = await collection.updateMany(
      { imageUrl: { $exists: false } },
      { $set: { imageUrl: '' } }
    );
    
    console.log(`Updated ${result.modifiedCount} Context documents with imageUrl field`);
  } catch (error) {
    console.error('Error updating Context schema:', error);
  }
};

// Update Post schema
const updatePostSchema = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('posts');
    
    // Check if imageUrl field exists in any document
    const sampleDoc = await collection.findOne({});
    console.log('Sample Post document fields:', Object.keys(sampleDoc || {}));
    
    // Add imageUrl field to all documents that don't have it
    const result = await collection.updateMany(
      { imageUrl: { $exists: false } },
      { $set: { imageUrl: '' } }
    );
    
    console.log(`Updated ${result.modifiedCount} Post documents with imageUrl field`);
  } catch (error) {
    console.error('Error updating Post schema:', error);
  }
};

// Update Theme schema
const updateThemeSchema = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('themes');
    
    // Check if imageUrl field exists in any document
    const sampleDoc = await collection.findOne({});
    console.log('Sample Theme document fields:', Object.keys(sampleDoc || {}));
    
    // Add imageUrl field to all documents that don't have it
    const result = await collection.updateMany(
      { imageUrl: { $exists: false } },
      { $set: { imageUrl: '' } }
    );
    
    console.log(`Updated ${result.modifiedCount} Theme documents with imageUrl field`);
  } catch (error) {
    console.error('Error updating Theme schema:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('\n=== Updating Context Schema ===');
  await updateContextSchema();
  
  console.log('\n=== Updating Post Schema ===');
  await updatePostSchema();
  
  console.log('\n=== Updating Theme Schema ===');
  await updateThemeSchema();
  
  console.log('\n=== Schema Update Complete ===');
  process.exit(0);
};

main().catch(console.error);
