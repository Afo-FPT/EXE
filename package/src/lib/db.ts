import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    const mongoURI = process.env.DB_URI || 'mongodb+srv://quanha:quanha123@cluster0.8qjqj.mongodb.net/exe_project?retryWrites=true&w=majority';
    console.log('🔗 Connecting to MongoDB...');
    console.log('🔗 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(mongoURI);
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false; // Reset connection status
    throw error;
  }
}
