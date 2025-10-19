const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
async function connectDB() {
  try {
    const DB_URI = 'mongodb+srv://quanha:quanha123@cluster0.8qjqj.mongodb.net/exe_project?retryWrites=true&w=majority';
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkAdmin() {
  try {
    await connectDB();
    
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('✅ Admin account found:');
      console.log('📧 Email:', admin.email);
      console.log('👤 Username:', admin.username);
      console.log('🔑 Role:', admin.role);
    } else {
      console.log('❌ No admin account found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAdmin();
