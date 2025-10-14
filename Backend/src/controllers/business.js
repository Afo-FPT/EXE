import {businessSchema} from "../schema/business.js";
import Business from '../model/business.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Đăng ký doanh nghiệp
export const signupBusiness = async (req, res) => {
    const {businessName, taxCode, email, password, confirmpassword, phone, address, scale, capital, website, logoUrl, description} = req.body;
    
    const {error} = businessSchema.validate(req.body,{abortEarly:false});
    if(error) {
        return res.status(400).json({
            errors: error.details.map(e => e.message)
        });
    }
    
    // Kiểm tra email hoặc taxCode đã tồn tại chưa
    const exist = await Business.findOne({ $or: [{ email }, { taxCode }] });
    if (exist) {
        return res.status(400).json({ errors: ["Email hoặc mã số thuế đã tồn tại!"] });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Lưu business mới
    const business = await Business.create({ 
        businessName, 
        taxCode, 
        email, 
        password: hashedPassword, 
        phone, 
        address, 
        scale, 
        capital, 
        website, 
        logoUrl, 
        description,
        role: 'business'
    });
    
    return res.status(201).json({
        message: "Đăng ký doanh nghiệp thành công! Vui lòng chờ admin phê duyệt.",
        data: { 
            id: business._id, 
            businessName: business.businessName, 
            email: business.email, 
            status: business.status 
        }
    });
};

// Đăng nhập doanh nghiệp
export const signinBusiness = async (req, res) => {
    const { email, password } = req.body;
    
    // Tìm business theo email
    const business = await Business.findOne({ email });
    if (!business) {
        return res.status(400).json({ errors: ["Tài khoản doanh nghiệp không tồn tại!"] });
    }
    
    // Kiểm tra trạng thái phê duyệt
    if (business.status !== 'approved') {
        return res.status(400).json({ errors: ["Tài khoản doanh nghiệp chưa được phê duyệt!"] });
    }
    
    // So sánh password
    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
        return res.status(400).json({ errors: ["Sai mật khẩu!"] });
    }
    
    // Tạo token
    const token = jwt.sign({ 
        id: business._id, 
        businessName: business.businessName, 
        email: business.email,
        role: business.role 
    }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    
    return res.status(200).json({
        message: "Đăng nhập thành công!",
        token,
        data: { 
            id: business._id, 
            businessName: business.businessName, 
            email: business.email, 
            role: business.role,
            status: business.status 
        }
    });
};

// Lấy danh sách business (chỉ admin)
export const getAllBusinesses = async (req, res) => {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) {
        query.status = status;
    }
    if (search) {
        query.$or = [
            { businessName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { taxCode: { $regex: search, $options: 'i' } }
        ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const businesses = await Business.find(query, '-password')
        .skip(skip)
        .limit(parseInt(limit));
    const total = await Business.countDocuments(query);
    
    return res.status(200).json({
        businesses,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        }
    });
};

// Phê duyệt/từ chối business (chỉ admin)
export const updateBusinessStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ errors: ["Trạng thái không hợp lệ!"] });
    }
    
    const business = await Business.findById(id);
    if (!business) {
        return res.status(404).json({ errors: ["Không tìm thấy doanh nghiệp!"] });
    }
    
    business.status = status;
    await business.save();
    
    return res.status(200).json({ 
        message: `Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} doanh nghiệp thành công!`, 
        business: { 
            id: business._id, 
            businessName: business.businessName, 
            email: business.email, 
            status: business.status 
        } 
    });
}; 