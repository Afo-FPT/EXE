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
  images: [String],
  price: Number,
  discountPercent: Number,
  stock: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const ChessPiece = mongoose.models.ChessPiece || mongoose.model('ChessPiece', chessPieceSchema);

// Check chess pieces data
const checkChessPiecesData = async () => {
  try {
    console.log('🔍 Checking chess pieces data...');
    
    const chessPieces = await ChessPiece.find({}).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${chessPieces.length} chess pieces:`);
    
    chessPieces.forEach((piece, index) => {
      console.log(`\n${index + 1}. Chess Piece:`);
      console.log(`   ID: ${piece._id}`);
      console.log(`   Name: ${piece.name}`);
      console.log(`   Type: ${piece.type}`);
      console.log(`   Collection: ${piece.collection}`);
      console.log(`   Description: ${piece.description}`);
      console.log(`   Has Model3D: ${!!piece.model3D}`);
      console.log(`   Has Images: ${!!piece.images && piece.images.length > 0}`);
      console.log(`   Images Count: ${piece.images ? piece.images.length : 0}`);
      console.log(`   Has Price: ${!!piece.price}`);
      console.log(`   Has Stock: ${!!piece.stock}`);
      console.log(`   Is Active: ${piece.isActive}`);
      console.log(`   Created: ${piece.createdAt}`);
    });
    
    // Check for schema issues
    console.log('\n🔍 Schema Analysis:');
    const oldSchemaPieces = chessPieces.filter(p => p.price !== undefined || p.stock !== undefined);
    const newSchemaPieces = chessPieces.filter(p => p.images !== undefined);
    
    console.log(`📊 Old schema pieces (with price/stock): ${oldSchemaPieces.length}`);
    console.log(`📊 New schema pieces (with images): ${newSchemaPieces.length}`);
    
    if (oldSchemaPieces.length > 0) {
      console.log('\n⚠️  Found pieces with old schema:');
      oldSchemaPieces.forEach(piece => {
        console.log(`   - ${piece.name} (ID: ${piece._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking chess pieces:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await checkChessPiecesData();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
};

main();
