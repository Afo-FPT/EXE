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

// ChessPiece schema
const chessPieceSchema = new mongoose.Schema({
  name: String,
  type: String,
  collection: String,
  description: String,
  model3D: String,
  image: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const ChessPiece = mongoose.models.ChessPiece || mongoose.model('ChessPiece', chessPieceSchema);

// Check chess pieces in database
const checkChessPieces = async () => {
  try {
    console.log('🔍 Checking chess pieces in database...');
    
    const chessPieces = await ChessPiece.find({}).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${chessPieces.length} chess pieces in database:`);
    
    chessPieces.forEach((piece, index) => {
      console.log(`\n${index + 1}. Chess Piece:`);
      console.log(`   ID: ${piece._id}`);
      console.log(`   Name: ${piece.name}`);
      console.log(`   Type: ${piece.type}`);
      console.log(`   Collection: ${piece.collection}`);
      console.log(`   Description: ${piece.description}`);
      console.log(`   Has Model3D: ${!!piece.model3D}`);
      console.log(`   Has Image: ${!!piece.image}`);
      console.log(`   Is Active: ${piece.isActive}`);
      console.log(`   Created: ${piece.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking chess pieces:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await checkChessPieces();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
};

main();
