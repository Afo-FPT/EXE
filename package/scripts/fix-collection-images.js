const mongoose = require('mongoose');
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

// Fix collection images
const fixCollectionImages = async () => {
  try {
    console.log('🔍 Finding collections with file names instead of base64...');
    
    const collections = await Collection.find({
      coverImage: { $exists: true, $ne: '' },
      $and: [
        { coverImage: { $not: /^data:image/ } }, // Not base64
        { coverImage: { $regex: /\.(jpg|jpeg|png|gif)$/i } } // File extension
      ]
    });

    console.log(`📊 Found ${collections.length} collections with file names`);

    for (const collection of collections) {
      console.log(`🔧 Fixing collection: ${collection.name}`);
      console.log(`   Current coverImage: ${collection.coverImage}`);
      
      // Set coverImage to empty string to show fallback
      collection.coverImage = '';
      await collection.save();
      
      console.log(`   ✅ Updated to empty string`);
    }

    console.log('✅ All collections fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing collections:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await fixCollectionImages();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
};

main();
