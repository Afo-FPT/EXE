import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// POST /api/create-admin-simple
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, email, password } = body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin account already exists',
        existingAdmin: {
          email: existingAdmin.email,
          username: existingAdmin.username
        }
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email or username already exists'
      }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const adminUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });
    
    await adminUser.save();
    
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin account',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
