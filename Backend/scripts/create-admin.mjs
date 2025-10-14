import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/exe_project';
    await mongoose.connect(DB_URI);
    console.log('✅ Kết nối MongoDB thành công');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

// Schema User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin', 'banned'], default: 'user', required: true }
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', userSchema);

// Tạo admin user
const createAdmin = async () => {
  try {
    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin user đã tồn tại:', existingAdmin.username);
      return;
    }

    // Tạo admin mới
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@exe.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user được tạo thành công!');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('📧 Email: admin@exe.com');
    console.log('👑 Role: admin');
  } catch (error) {
    console.error('❌ Lỗi tạo admin user:', error);
  }
};

// Chạy script
const main = async () => {
  await connectDB();
  await createAdmin();
  mongoose.connection.close();
  console.log('🔌 Đã đóng kết nối MongoDB');
};

main().catch(console.error);
