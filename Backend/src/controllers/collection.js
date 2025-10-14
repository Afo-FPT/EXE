import Collection from '../model/collection.js';
import ChessPiece from '../model/chessPiece.js';

// Tạo collection mới
export const createCollection = async (req, res) => {
    try {
        console.log('🎯 Creating new collection...');
        console.log('📝 Request body:', req.body);
        console.log('📁 Uploaded file:', req.file);

        const { name, description, theme, endDate } = req.body;
        
        // Xử lý coverImage
        let coverImage = '';
        if (req.file) {
            // Tạo URL để truy cập ảnh từ frontend
            coverImage = `/uploads/collections/${req.file.filename}`;
            console.log('📷 Uploaded image path:', coverImage);
        } else if (req.body.coverImage) {
            // Kiểm tra nếu là placeholder URL thì từ chối
            if (req.body.coverImage.includes('placeholder') || req.body.coverImage.includes('via.placeholder')) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể sử dụng placeholder URL làm ảnh collection! Vui lòng upload ảnh thực.'
                });
            }
            coverImage = req.body.coverImage;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Cover image là bắt buộc! Vui lòng upload ảnh collection.'
            });
        }

        // Kiểm tra collection đã tồn tại
        const existingCollection = await Collection.findOne({ name });
        if (existingCollection) {
            return res.status(400).json({
                success: false,
                message: 'Collection với tên này đã tồn tại!'
            });
        }

        const collectionData = {
            name,
            description,
            coverImage,
            theme,
            endDate: endDate || null,
            createdBy: req.user.id,
            totalChessPieces: 0,
            rarityDistribution: {
                common: 0,
                rare: 0,
                epic: 0,
                legendary: 0
            }
        };

        const collection = new Collection(collectionData);
        await collection.save();

        console.log('✅ Collection created successfully:', collection);

        res.status(201).json({
            success: true,
            message: 'Tạo collection thành công!',
            collection
        });
    } catch (error) {
        console.error('❌ Error creating collection:', error);
        
        let errorMessage = 'Lỗi server khi tạo collection';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Dữ liệu không hợp lệ';
        } else if (error.name === 'CastError') {
            errorMessage = 'ID không hợp lệ';
        } else if (error.code === 11000) {
            errorMessage = 'Collection với tên này đã tồn tại';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
        });
    }
};

// Lấy tất cả collections
export const getAllCollections = async (req, res) => {
    try {
        console.log('📋 Getting all collections...');
        
        const collections = await Collection.find()
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${collections.length} collections`);

        res.json({
            success: true,
            collections
        });
    } catch (error) {
        console.error('❌ Error getting collections:', error);
        
        let errorMessage = 'Lỗi server khi lấy collections';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Dữ liệu không hợp lệ';
        } else if (error.name === 'CastError') {
            errorMessage = 'ID không hợp lệ';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
        });
    }
};

// Lấy collection theo ID (public - không cần authentication)
export const getCollectionByIdPublic = async (req, res) => {
    try {
        console.log('🔍 Getting collection by ID (public):', req.params.id);
        
        const collection = await Collection.findById(req.params.id)
            .populate('createdBy', 'username email');

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy collection!'
            });
        }

        console.log('✅ Collection found (public):', collection.name);

        res.json({
            success: true,
            collection
        });
    } catch (error) {
        console.error('❌ Error getting collection by ID (public):', error);
        
        let errorMessage = 'Lỗi server khi lấy collection';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Dữ liệu không hợp lệ';
        } else if (error.name === 'CastError') {
            errorMessage = 'ID không hợp lệ';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
        });
    }
};

// Lấy collection theo ID
export const getCollectionById = async (req, res) => {
    try {
        console.log('🔍 Getting collection by ID:', req.params.id);
        
        const collection = await Collection.findById(req.params.id)
            .populate('createdBy', 'username email');

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy collection!'
            });
        }

        console.log('✅ Collection found:', collection.name);

        res.json({
            success: true,
            collection
        });
    } catch (error) {
        console.error('❌ Error getting collection by ID:', error);
        
        let errorMessage = 'Lỗi server khi lấy collection';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Dữ liệu không hợp lệ';
        } else if (error.name === 'CastError') {
            errorMessage = 'ID không hợp lệ';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
        });
    }
};

// Cập nhật collection
export const updateCollection = async (req, res) => {
    try {
        console.log('✏️ Updating collection:', req.params.id);
        console.log('📝 Update data:', req.body);

        const { name, description, theme, endDate, isActive } = req.body;
        
        // Xử lý coverImage
        let updateData = { name, description, theme, endDate, isActive };
        if (req.file) {
            // Tạo URL để truy cập ảnh từ frontend
            updateData.coverImage = `/uploads/collections/${req.file.filename}`;
            console.log('📷 Updated image path:', updateData.coverImage);
        } else if (req.body.coverImage) {
            updateData.coverImage = req.body.coverImage;
        }

        // Loại bỏ các giá trị undefined
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        const collection = await Collection.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy collection!'
            });
        }

        console.log('✅ Collection updated successfully:', collection.name);

        res.json({
            success: true,
            message: 'Cập nhật collection thành công!',
            collection
        });
    } catch (error) {
        console.error('❌ Error updating collection:', error);
        
        let errorMessage = 'Lỗi server khi cập nhật collection';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Dữ liệu không hợp lệ';
        } else if (error.name === 'CastError') {
            errorMessage = 'ID không hợp lệ';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
        });
    }
};

// Xóa collection
export const deleteCollection = async (req, res) => {
    try {
        console.log('🗑️ Deleting collection:', req.params.id);

        // Kiểm tra xem collection có quân cờ nào không
        const chessPiecesCount = await ChessPiece.countDocuments({ collection: req.params.id });
        if (chessPiecesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa collection! Còn ${chessPiecesCount} quân cờ trong collection này.`
            });
        }

        const collection = await Collection.findByIdAndDelete(req.params.id);
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy collection!'
            });
        }

        console.log('✅ Collection deleted successfully:', collection.name);

        res.json({
            success: true,
            message: 'Xóa collection thành công!'
        });
    } catch (error) {
        console.error('❌ Error deleting collection:', error);
        
        let errorMessage = 'Lỗi server khi xóa collection';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Dữ liệu không hợp lệ';
        } else if (error.name === 'CastError') {
            errorMessage = 'ID không hợp lệ';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
        });
    }
};

// Lấy collections active (cho frontend)
export const getActiveCollections = async (req, res) => {
    try {
        console.log('🌟 Getting active collections...');
        
        // Lấy collections active
        const collections = await Collection.find({ isActive: true })
            .select('name description coverImage theme totalChessPieces rarityDistribution releaseDate')
            .sort({ createdAt: -1 });
            
        console.log('📊 Active collections found:', collections.length);
        collections.forEach(collection => {
            console.log(`- ${collection.name}: coverImage=${collection.coverImage}`);
        });

        // Cập nhật thống kê cho mỗi collection
        for (let collection of collections) {
            const chessPieces = await ChessPiece.find({ 
                collection: collection._id, 
                isActive: true 
            });
            
            if (collection.totalChessPieces !== chessPieces.length) {
                collection.totalChessPieces = chessPieces.length;
                
                // Tính toán phân bố độ hiếm
                const rarityCount = { common: 0, rare: 0, epic: 0, legendary: 0 };
                chessPieces.forEach(piece => {
                    if (piece.rarity && rarityCount.hasOwnProperty(piece.rarity)) {
                        rarityCount[piece.rarity]++;
                    }
                });
                
                collection.rarityDistribution = rarityCount;
                await collection.save();
                console.log(`✅ Updated collection ${collection.name} statistics`);
            }
        }

        // Debug: Log chi tiết về ảnh
        collections.forEach(collection => {
            if (collection.coverImage) {
                console.log(`🖼️ Collection ${collection.name}:`);
                console.log(`   - Cover Image Path: ${collection.coverImage}`);
                console.log(`   - Full URL would be: http://localhost:5000${collection.coverImage}`);
            } else {
                console.log(`❌ Collection ${collection.name} has no cover image!`);
            }
        });

        console.log(`✅ Found ${collections.length} collections`);

        res.json({
            success: true,
            collections
        });
    } catch (error) {
        console.error('❌ Error getting active collections:', error);
        
        let errorMessage = 'Lỗi server khi lấy active collections';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Dữ liệu không hợp lệ';
        } else if (error.name === 'CastError') {
            errorMessage = 'ID không hợp lệ';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
        });
    }
};
