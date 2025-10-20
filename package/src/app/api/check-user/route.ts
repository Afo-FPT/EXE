import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// GET /api/check-user
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/check-user - Starting...');
    await connectDB();
    console.log('✅ Database connected');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin01@gmail.com' });
    console.log('👤 Admin user found:', adminUser ? 'Yes' : 'No');
    
    if (adminUser) {
      console.log('👤 Admin user details:', {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        hasPassword: !!adminUser.password
      });
    }
    
    // Count total users
    const totalUsers = await User.countDocuments();
    console.log('📊 Total users:', totalUsers);
    
    return NextResponse.json({
      success: true,
      adminExists: !!adminUser,
      adminUser: adminUser ? {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      } : null,
      totalUsers
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Check user error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/check-user - Create admin user
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/check-user - Creating admin...');
    await connectDB();
    console.log('✅ Database connected');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin01@gmail.com' });
    if (existingAdmin) {
      console.log('👤 Admin already exists');
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          id: existingAdmin._id,
          username: existingAdmin.username,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      }, { status: 200 });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('123123', 10);
    const adminUser = new User({
      username: 'Admin01',
      email: 'admin01@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created:', adminUser._id);
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Create admin error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
