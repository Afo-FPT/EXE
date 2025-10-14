import { MysteryBag } from '../model/product.js';
import Collection from '../model/collection.js';
import { mysteryBagSchema } from '../schema/product.js';

// Helper function để tìm hoặc tạo collection
const findOrCreateCollection = async (collectionName, userId) => {
    try {
        // Tìm collection theo tên (case insensitive)
        let collection = await Collection.findOne({ 
            name: { $regex: new RegExp(`^${collectionName}$`, 'i') } 
        });
        
        // Nếu không tìm thấy, tạo collection mới
        if (!collection) {
            collection = await Collection.create({
                name: collectionName,
                description: `Bộ sưu tập ${collectionName}`,
                coverImage: '/uploads/collections/default-collection.jpg', // Ảnh mặc định
                createdBy: userId, // ID của admin tạo
                isActive: true
            });
            console.log(`✅ Created new collection: ${collectionName}`);
        }
        
        return collection._id;
    } catch (error) {
        console.error('Error finding/creating collection:', error);
        throw error;
    }
};

// Tạo túi mù mới
export const createMysteryBag = async (req, res) => {
    try {
        console.log('📝 Create Mystery Bag Request Body:', req.body);
        console.log('📁 File:', req.file);
        
        // Xử lý file upload
        let imagePath = '';
        if (req.file) {
            imagePath = `/uploads/products/${req.file.filename}`;
        } else {
            return res.status(400).json({ errors: ['Hình ảnh sản phẩm là bắt buộc!'] });
        }

        // Tìm hoặc tạo collection
        const collectionId = await findOrCreateCollection(req.body.collection, req.user.id);

        // Chuẩn bị dữ liệu với đường dẫn hình ảnh và collection ID
        const bagData = {
            name: req.body.name,
            collection: collectionId,
            description: req.body.description,
            price: parseFloat(req.body.price),
            discountPercent: parseFloat(req.body.discountPercent) || 0,
            stock: parseInt(req.body.stock) || 0,
            image: imagePath,
            isActive: true
        };
        
        console.log('📦 Bag Data:', bagData);

        const { error } = mysteryBagSchema.validate(bagData, { abortEarly: false });
        if (error) {
            console.log('❌ Validation Error:', error.details);
            return res.status(400).json({ errors: error.details.map(e => e.message) });
        }

        const mysteryBag = await MysteryBag.create(bagData);
        console.log('✅ Mystery Bag Created:', mysteryBag);
        return res.status(201).json({ message: 'Tạo túi mù thành công!', data: mysteryBag });
    } catch (err) {
        console.error('❌ Create Mystery Bag Error:', err);
        return res.status(500).json({ errors: [err.message] });
    }
};

// Lấy danh sách túi mù
export const getAllMysteryBags = async (req, res) => {
    try {
        const { isActive } = req.query;
        let filter = {};
        
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        
        const mysteryBags = await MysteryBag.find(filter).populate('collection', 'name');
        return res.status(200).json({ data: mysteryBags });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};

// Lấy túi mù theo id
export const getMysteryBagById = async (req, res) => {
    try {
        const mysteryBag = await MysteryBag.findById(req.params.id).populate('collection', 'name');
        if (!mysteryBag) {
            return res.status(404).json({ errors: ['Không tìm thấy túi mù!'] });
        }
        return res.status(200).json({ data: mysteryBag });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};

// Cập nhật túi mù
export const updateMysteryBag = async (req, res) => {
    try {
        // Xử lý file upload (nếu có)
        let updateData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            discountPercent: parseFloat(req.body.discountPercent) || 0,
            stock: parseInt(req.body.stock) || 0,
            isActive: true
        };
        
        if (req.file) {
            updateData.image = `/uploads/products/${req.file.filename}`;
        }

        // Tìm hoặc tạo collection nếu có thay đổi tên collection
        if (req.body.collection) {
            updateData.collection = await findOrCreateCollection(req.body.collection, req.user.id);
        }

        const { error } = mysteryBagSchema.validate(updateData, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(e => e.message) });
        }

        const mysteryBag = await MysteryBag.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('collection', 'name');
        if (!mysteryBag) {
            return res.status(404).json({ errors: ['Không tìm thấy túi mù!'] });
        }
        return res.status(200).json({ message: 'Cập nhật thành công!', data: mysteryBag });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};

// Xóa túi mù
export const deleteMysteryBag = async (req, res) => {
    try {
        const mysteryBag = await MysteryBag.findByIdAndDelete(req.params.id);
        if (!mysteryBag) {
            return res.status(404).json({ errors: ['Không tìm thấy túi mù!'] });
        }
        return res.status(200).json({ message: 'Xóa thành công!' });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};

// Lấy túi mù cho cửa hàng công khai (chỉ những túi đang hoạt động)
export const getPublicMysteryBags = async (req, res) => {
    try {
        const mysteryBags = await MysteryBag.find({ isActive: true }).populate('collection', 'name');
        return res.status(200).json({ data: mysteryBags });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};
