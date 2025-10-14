import {registerSchema} from "../schema/auth.js";
import User from '../model/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';

export const signup = async (req, res) => {
    console.log('📝 Signup request body:', req.body);
    const {username,email, password, confirmpassword, role} = req.body;
    
    const {error} = registerSchema.validate(req.body,{abortEarly:false});
    if(error) {
        console.log('❌ Validation error:', error.details);
        return res.status(400).json({
            errors: error.details.map(e => e.message)
        });
    }
    
    // Kiểm tra email hoặc username đã tồn tại chưa
    let exist;
    try {
        console.log('🔍 Checking if user already exists:', username, email);
        exist = await User.findOne({ $or: [{ email }, { username }] });
        if (exist) {
            console.log('❌ User already exists:', exist.username, exist.email);
            return res.status(400).json({ errors: ["Email hoặc username đã tồn tại!"] });
        }
        console.log('✅ Username and email are available');
    } catch (dbError) {
        console.error('❌ Database error checking existing user:', dbError);
        return res.status(500).json({ errors: ["Lỗi database, vui lòng thử lại"] });
    }
    
    // Hash password
    let hashedPassword;
    try {
        console.log('🔐 Hashing password...');
        hashedPassword = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed successfully');
    } catch (bcryptError) {
        console.error('❌ Bcrypt hash error:', bcryptError);
        return res.status(500).json({ errors: ["Lỗi mã hóa mật khẩu, vui lòng thử lại"] });
    }
    
    // Xác định role: chỉ admin mới được tạo user với role admin
    let newRole = 'user';
    if (role === 'admin') {
        console.log('👑 Attempting to create admin user...');
        // Kiểm tra token và quyền admin
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('❌ No authorization header for admin creation');
            return res.status(403).json({ errors: ["Không có quyền tạo tài khoản admin!"] });
        }
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            let currentUser;
            try {
                currentUser = await User.findById(decoded.id);
                if (currentUser && currentUser.role === 'admin') {
                    newRole = 'admin';
                    console.log('✅ Admin role granted by:', currentUser.username);
                } else {
                    console.log('❌ User is not admin:', currentUser?.username, currentUser?.role);
                    return res.status(403).json({ errors: ["Chỉ admin mới được tạo tài khoản admin!"] });
                }
            } catch (dbError) {
                console.error('❌ Database error checking admin:', dbError);
                return res.status(500).json({ errors: ["Lỗi database, vui lòng thử lại"] });
            }
        } catch (err) {
            console.error('❌ JWT verification error for admin creation:', err);
            return res.status(403).json({ errors: ["Token không hợp lệ!"] });
        }
    }
    
    // Lưu user mới
    let user;
    try {
        console.log('💾 Creating new user with role:', newRole);
        user = await User.create({ 
            username, 
            email, 
            password: hashedPassword, 
            role: newRole
        });
        console.log('✅ User created successfully:', user._id, 'Username:', user.username, 'Role:', user.role);
    } catch (dbError) {
        console.error('❌ Database error creating user:', dbError);
        return res.status(500).json({ errors: ["Lỗi database, vui lòng thử lại"] });
    }

    // Tạo token sau khi đăng ký thành công
    let token;
    try {
        console.log('🎫 Creating JWT token for new user');
        token = jwt.sign({ 
            id: user._id, 
            username: user.username, 
            email: user.email
        }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        console.log('✅ JWT token created successfully');
    } catch (jwtError) {
        console.error('❌ JWT error during signup:', jwtError);
        return res.status(500).json({ errors: ["Lỗi tạo token, vui lòng thử lại"] });
    }

    const response = {
        message: "Đăng ký thành công!",
        token,
        data: { id: user._id, username: user.username, email: user.email, role: user.role }
    };
    console.log('✅ Signup response:', response);
    return res.status(201).json(response);
};

// Đăng nhập
export const signin = async (req, res) => {
    console.log('🔐 Signin request body:', req.body);
    const { username, email, password } = req.body;
    
    // Fallback: Mock admin user khi database không available
    if (!mongoose.connection.readyState) {
        console.log('⚠️ Database not connected, using mock admin');
        
        // Mock admin credentials
        if ((email === 'admin@exe.com' || username === 'admin') && password === 'admin123') {
            const mockToken = jwt.sign({
                id: 'mock-admin-id',
                username: 'admin', 
                email: 'admin@exe.com',
                role: 'admin'
            }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1d' });
            
            return res.json({
                message: "Đăng nhập thành công!",
                token: mockToken,
                data: { 
                    id: 'mock-admin-id', 
                    username: 'admin', 
                    email: 'admin@exe.com', 
                    role: 'admin' 
                }
            });
        } else {
            return res.status(400).json({ errors: ["Tài khoản không tồn tại!"] });
        }
    }
    
    // Tìm user theo username hoặc email
    let user;
    try {
        console.log('🔍 Looking for user with username/email:', username || email);
        user = await User.findOne({ $or: [ { email }, { username } ] });
        if (!user) {
            console.log('❌ User not found for signin:', username || email);
            return res.status(400).json({ errors: ["Tài khoản không tồn tại!"] });
        }
        console.log('✅ User found for signin:', user._id, 'Username:', user.username, 'Role:', user.role);
    } catch (dbError) {
        console.error('❌ Database error during signin:', dbError);
        return res.status(500).json({ errors: ["Lỗi database, vui lòng thử lại"] });
    }
    
    // So sánh password
    let isMatch;
    try {
        console.log('🔐 Verifying password...');
        isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password mismatch for user:', user.username);
            return res.status(400).json({ errors: ["Sai mật khẩu!"] });
        }
        console.log('✅ Password verified successfully for user:', user.username);
    } catch (bcryptError) {
        console.error('❌ Bcrypt error during signin:', bcryptError);
        return res.status(500).json({ errors: ["Lỗi xác thực mật khẩu, vui lòng thử lại"] });
    }
    
    // Tạo token
    let token;
    try {
        console.log('🎫 Creating JWT token for user:', user.username);
        token = jwt.sign({ 
            id: user._id, 
            username: user.username, 
            email: user.email
        }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        console.log('✅ JWT token created successfully for signin');
    } catch (jwtError) {
        console.error('❌ JWT error during signin:', jwtError);
        return res.status(500).json({ errors: ["Lỗi tạo token, vui lòng thử lại"] });
    }
    
    const response = {
        message: "Đăng nhập thành công!",
        token,
        data: { id: user._id, username: user.username, email: user.email, role: user.role }
    };
    console.log('✅ Signin response:', response);
    return res.status(200).json(response);
};

// Đăng xuất (logout)
export const logout = async (req, res) => {
    // Với JWT, logout phía backend chỉ đơn giản là thông báo thành công
    // (Client chỉ cần xoá token ở localStorage/cookie)
    return res.status(200).json({ message: "Đăng xuất thành công!" });
};

// Middleware kiểm tra admin
export const isAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('❌ No authorization header provided for admin check');
        return res.status(401).json({ errors: ["Không có token!"] });
    }
    
    try {
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('❌ No token found in authorization header for admin check');
            return res.status(401).json({ errors: ["Token không hợp lệ!"] });
        }
        
        console.log('🔑 Verifying admin token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        console.log('✅ Admin token verified, user ID:', decoded.id);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('❌ Admin user not found for token:', decoded.id);
            return res.status(401).json({ errors: ["Token không hợp lệ!"] });
        }
        
        if (user.role !== 'admin') {
            console.log('❌ User is not admin:', user.username, 'Role:', user.role);
            return res.status(403).json({ errors: ["Chỉ admin mới được phép!"] });
        }
        
        console.log('✅ Admin user authenticated:', user.username, 'Role:', user.role);
        req.user = user;
        next();
    } catch (err) {
        console.error('❌ JWT verification error for admin:', err);
        return res.status(401).json({ errors: ["Token không hợp lệ!"] });
    }
};

// Lấy danh sách user (chỉ admin)
export const getAllUsers = async (req, res) => {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role) {
        query.role = role;
    }
    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query, '-password')
        .skip(skip)
        .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    return res.status(200).json({
        users,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        }
    });
};

// Ban user (chỉ admin)
export const banUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ errors: ["Không tìm thấy user!"] });
    }
    if (user.role === 'admin') {
        return res.status(403).json({ errors: ["Không thể ban admin!"] });
    }
    user.role = 'banned';
    await user.save();
    return res.status(200).json({ message: "Đã ban user thành công!", user: { id: user._id, username: user.username, email: user.email, role: user.role } });
};

// Lấy thống kê dashboard (chỉ admin)
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const regularUsers = await User.countDocuments({ role: 'user' });

        const stats = {
            totalUsers,
            adminUsers,
            regularUsers
        };

        return res.status(200).json({ stats });
    } catch (error) {
        console.error('❌ Error getting dashboard stats:', error);
        return res.status(500).json({ errors: ["Lỗi khi lấy thống kê dashboard"] });
    }
}; 

// Verify token endpoint
export const verifyToken = async (req, res) => {
    try {
        console.log('🔍 Verifying token for user:', req.user._id);
        
        return res.status(200).json({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
        });
    } catch (error) {
        console.error('❌ Error verifying token:', error);
        return res.status(500).json({ errors: ["Lỗi khi xác thực token"] });
    }
};

// Middleware kiểm tra xác thực (đã đăng nhập)
export const isAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('❌ No authorization header provided');
        return res.status(401).json({ errors: ["Không có token!"] });
    }
    
    try {
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('❌ No token found in authorization header');
            return res.status(401).json({ errors: ["Token không hợp lệ!"] });
        }
        
        console.log('🔑 Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        console.log('✅ Token verified, user ID:', decoded.id);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('❌ User not found for token:', decoded.id);
            return res.status(401).json({ errors: ["Token không hợp lệ!"] });
        }
        
        if (user.role === 'banned') {
            console.log('❌ User is banned:', decoded.id);
            return res.status(403).json({ errors: ["Tài khoản đã bị khóa!"] });
        }
        
        console.log('✅ User authenticated:', user.username, 'Role:', user.role);
        req.user = user;
        next();
    } catch (err) {
        console.error('❌ JWT verification error:', err);
        return res.status(401).json({ errors: ["Token không hợp lệ!"] });
    }
};

// Google OAuth Login
export const googleLogin = async (req, res) => {
    try {
        console.log('🔐 Google OAuth login request');
        const { token, userData } = req.body;
        
        if (!token && !userData) {
            return res.status(400).json({ 
                success: false, 
                message: 'Google token or userData is required' 
            });
        }

        // If userData is provided, use it directly (from access token)
        if (userData) {
            console.log('✅ Using userData from access token:', userData.email);
            const { id: googleId, email, name, picture } = userData;
            
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
                    console.log('✅ Updated user with Google ID');
                }
            } else {
                // Create new user
                user = new User({
                    username: email.split('@')[0], // Use email prefix as username
                    email: email,
                    googleId: googleId,
                    name: name,
                    avatar: picture,
                    role: 'user', // Default role
                    isEmailVerified: true // Google emails are verified
                });
                
                await user.save();
                console.log('✅ Created new user from Google OAuth');
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
            
            console.log('✅ Google login successful for:', user.username);
            
            return res.json({
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
            });
        }

        // Fallback: verify ID token if no userData provided
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({
                success: false,
                message: 'Google Client ID not configured'
            });
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        
        console.log('✅ Google token verified for:', email);
        
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
                console.log('✅ Updated user with Google ID');
            }
        } else {
            // Create new user
            user = new User({
                username: email.split('@')[0], // Use email prefix as username
                email: email,
                googleId: googleId,
                name: name,
                avatar: picture,
                role: 'user', // Default role
                isEmailVerified: true // Google emails are verified
            });
            
            await user.save();
            console.log('✅ Created new user from Google OAuth');
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
        
        console.log('✅ Google login successful for:', user.username);
        
        res.json({
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
        });
        
    } catch (error) {
        console.error('❌ Google OAuth error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message
        });
    }
}; 