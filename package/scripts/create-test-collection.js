const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Collection schema
const collectionSchema = new mongoose.Schema({
  name: String,
  description: String,
  coverImage: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const Collection = mongoose.models.Collection || mongoose.model('Collection', collectionSchema);

// Create test collection with image
const createTestCollection = async () => {
  try {
    console.log('🔍 Creating test collection with image...');
    
    // Create a simple base64 image (1x1 pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const testCollection = new Collection({
      name: 'Test Collection with Image',
      description: 'This is a test collection to verify image display',
      coverImage: testImageBase64,
      isActive: true
    });
    
    await testCollection.save();
    console.log('✅ Test collection created successfully!');
    console.log('   ID:', testCollection._id);
    console.log('   Name:', testCollection.name);
    console.log('   Has Image:', !!testCollection.coverImage);
    console.log('   Image Length:', testCollection.coverImage?.length || 0);
    
  } catch (error) {
    console.error('❌ Error creating test collection:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createTestCollection();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
};

main();
