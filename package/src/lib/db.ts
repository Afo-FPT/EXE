import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const mongoURI = process.env.DB_URI || 'mongodb+srv://quanha:quanha123@cluster0.8qjqj.mongodb.net/exe_project?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI);
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}
