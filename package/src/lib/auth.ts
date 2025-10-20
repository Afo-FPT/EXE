import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from './db';
import User from './models/User';

// Connect to database
connectDB();

export async function signup(userData: any) {
  try {
    const { username, email, password, confirmpassword, role } = userData;
    
    // Validation
    if (!username || !email || !password) {
      return {
        success: false,
        message: 'All fields are required'
      };
    }
    
    if (password !== confirmpassword) {
      return {
        success: false,
        message: 'Passwords do not match'
      };
    }
    
    // Connect to database
    await connectDB();
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return {
        success: false,
        message: 'Email or username already exists'
      };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    return {
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'Server error'
    };
  }
}

export async function signin(userData: any) {
  try {
    console.log('🔍 signin function - Starting...');
    const { email, password } = userData;
    console.log('📝 Signin data:', { email, password: password ? '***' : 'missing' });
    
    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return {
        success: false,
        message: 'Email and password are required'
      };
    }
    
    // Connect to database
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    
    // Find user
    console.log('🔍 Finding user with email:', email);
    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }
    
    console.log('👤 User details:', {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });
    
    // Check password
    console.log('🔐 Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }
    
    // Ensure username exists (fallback for existing users)
    if (!user.username) {
      console.log('📝 Setting username from email');
      user.username = user.email.split('@')[0];
      await user.save();
    }
    
    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    console.log('✅ JWT token generated');
    
    const result = {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
    
    console.log('✅ Signin successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Signin error:', error);
    return {
      success: false,
      message: 'Server error'
    };
  }
}

export async function googleLogin(userData: any) {
  try {
    const { token, userData: googleUserData } = userData;
    
    if (!token && !googleUserData) {
      return {
        success: false,
        message: 'Google token or userData is required'
      };
    }
    
    // If userData is provided, use it directly
    if (googleUserData) {
      const { id: googleId, email, name, picture } = googleUserData;
      
      // Check if user exists
      let user = await User.findOne({ 
        $or: [
          { email: email },
          { googleId: googleId }
        ]
      });
      
      if (user) {
        // User exists, update Google ID if not set
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
      } else {
        // Create new user
        user = new User({
          username: email.split('@')[0],
          email: email,
          googleId: googleId,
          name: name,
          avatar: picture,
          role: 'user',
          isEmailVerified: true
        });
        
        await user.save();
      }
      
      // Generate JWT token
      const jwtToken = jwt.sign(
        { 
          id: user._id, 
          username: user.username, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      return {
        success: true,
        message: 'Google login successful',
        token: jwtToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        }
      };
    }
    
    // Fallback: verify ID token
    if (!process.env.GOOGLE_CLIENT_ID) {
      return {
        success: false,
        message: 'Google Client ID not configured'
      };
    }
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return {
        success: false,
        message: 'Invalid Google token'
      };
    }
    
    const { sub: googleId, email, name, picture } = payload;
    
    if (!email) {
      return {
        success: false,
        message: 'Email not found in Google token'
      };
    }
    
    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });
    
    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      
      // Ensure username exists (fallback for existing users)
      if (!user.username) {
        user.username = email.split('@')[0];
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        username: email.split('@')[0],
        email: email,
        googleId: googleId,
        name: name,
        avatar: picture,
        role: 'user',
        isEmailVerified: true
      });
      
      await user.save();
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    return {
      success: true,
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Google login error:', error);
    return {
      success: false,
      message: 'Google login failed'
    };
  }
}
