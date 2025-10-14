import ChessPiece from '../model/chessPiece.js';
import Collection from '../model/collection.js';

// Tạo quân cờ mới
export const createChessPiece = async (req, res) => {
    try {
        console.log('🎯 Creating new chess piece...');
        console.log('📝 Request body:', req.body);
        console.log('📁 Uploaded file:', req.file);

        const { name, type, rarity, description, dropRate, collectionId } = req.body;
        
        // Xử lý image
        let image = '';
        if (req.file) {
            image = req.file.path || req.file.filename;
        } else if (req.body.image) {
            image = req.body.image;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Hình ảnh quân cờ là bắt buộc!'
            });
        }

        // Xử lý model3D (optional)
        let model3D = '';
        if (req.file) {
            // File được upload từ máy tính
            model3D = `/uploads/models/${req.file.filename}`;
            console.log('📁 3D Model uploaded:', model3D);
        } else if (req.body.model3D) {
            // URL được nhập thủ công
            model3D = req.body.model3D;
            console.log('🔗 3D Model URL:', model3D);
        }

        // Kiểm tra collection tồn tại
        const collection = await Collection.findById(collectionId);
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy collection!'
            });
        }

        // Kiểm tra quân cờ đã tồn tại trong collection
        const existingPiece = await ChessPiece.findOne({ 
            name, 
            collection: collectionId 
        });
        if (existingPiece) {
            return res.status(400).json({
                success: false,
                message: 'Quân cờ này đã tồn tại trong collection!'
            });
        }

        const chessPieceData = {
            name,
            type,
            rarity,
            image,
            model3D, // Thêm model3D vào data
            description: description || '',
            dropRate: dropRate ? Number(dropRate) : 10,
            collection: collectionId,
            createdBy: req.user.id
        };

        const chessPiece = new ChessPiece(chessPieceData);
        await chessPiece.save();

        // Cập nhật thống kê collection
        collection.totalChessPieces += 1;
        collection.rarityDistribution[rarity] += 1;
        await collection.save();

        console.log('✅ Chess piece created successfully:', chessPiece);

        res.status(201).json({
            success: true,
            message: 'Tạo quân cờ thành công!',
            chessPiece
        });
    } catch (error) {
        console.error('❌ Error creating chess piece:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo quân cờ',
            error: error.message
        });
    }
};

// Lấy tất cả quân cờ của một collection
export const getChessPiecesByCollection = async (req, res) => {
    try {
        console.log('📋 Getting chess pieces for collection:', req.params.collectionId);
        
        const chessPieces = await ChessPiece.find({ 
            collection: req.params.collectionId,
            isActive: true 
        }).sort({ rarity: 1, name: 1 });

        console.log(`✅ Found ${chessPieces.length} chess pieces`);

        res.json({
            success: true,
            chessPieces
        });
    } catch (error) {
        console.error('❌ Error getting chess pieces:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy quân cờ',
            error: error.message
        });
    }
};

// Lấy quân cờ theo ID
export const getChessPieceById = async (req, res) => {
    try {
        console.log('🔍 Getting chess piece by ID:', req.params.id);
        
        const chessPiece = await ChessPiece.findById(req.params.id)
            .populate('collection', 'name theme')
            .populate('createdBy', 'username');

        if (!chessPiece) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quân cờ!'
            });
        }

        console.log('✅ Chess piece found:', chessPiece.name);

        res.json({
            success: true,
            chessPiece
        });
    } catch (error) {
        console.error('❌ Error getting chess piece:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy quân cờ',
            error: error.message
        });
    }
};

// Cập nhật quân cờ
export const updateChessPiece = async (req, res) => {
    try {
        console.log('✏️ Updating chess piece:', req.params.id);
        console.log('📝 Update data:', req.body);

        const { name, type, rarity, description, dropRate, isActive } = req.body;
        
        // Xử lý image
        let updateData = { name, type, rarity, description, dropRate, isActive };
        if (req.file) {
            updateData.image = req.file.path || req.file.filename;
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }

        // Xử lý model3D
        if (req.file) {
            // File được upload từ máy tính
            updateData.model3D = `/uploads/models/${req.file.filename}`;
            console.log('📁 3D Model updated:', updateData.model3D);
        } else if (req.body.model3D !== undefined) {
            // URL được nhập thủ công hoặc xóa
            updateData.model3D = req.body.model3D;
            console.log('🔗 3D Model URL updated:', updateData.model3D);
        }

        // Loại bỏ các giá trị undefined
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        const chessPiece = await ChessPiece.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!chessPiece) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quân cờ!'
            });
        }

        console.log('✅ Chess piece updated successfully:', chessPiece.name);

        res.json({
            success: true,
            message: 'Cập nhật quân cờ thành công!',
            chessPiece
        });
    } catch (error) {
        console.error('❌ Error updating chess piece:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật quân cờ',
            error: error.message
        });
    }
};

// Xóa quân cờ
export const deleteChessPiece = async (req, res) => {
    try {
        console.log('🗑️ Deleting chess piece:', req.params.id);

        const chessPiece = await ChessPiece.findById(req.params.id);
        if (!chessPiece) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quân cờ!'
            });
        }

        // Cập nhật thống kê collection
        const collection = await Collection.findById(chessPiece.collection);
        if (collection) {
            collection.totalChessPieces = Math.max(0, collection.totalChessPieces - 1);
            collection.rarityDistribution[chessPiece.rarity] = Math.max(0, collection.rarityDistribution[chessPiece.rarity] - 1);
            await collection.save();
        }

        await ChessPiece.findByIdAndDelete(req.params.id);

        console.log('✅ Chess piece deleted successfully:', chessPiece.name);

        res.json({
            success: true,
            message: 'Xóa quân cờ thành công!'
        });
    } catch (error) {
        console.error('❌ Error deleting chess piece:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa quân cờ',
            error: error.message
        });
    }
};

// Lấy tất cả quân cờ (cho admin)
export const getAllChessPieces = async (req, res) => {
    try {
        console.log('📋 Getting all chess pieces...');
        
        const { page = 1, limit = 20, rarity, type, collection } = req.query;
        
        const query = {};
        if (rarity) query.rarity = rarity;
        if (type) query.type = type;
        if (collection) query.collection = collection;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const chessPieces = await ChessPiece.find(query)
            .populate('collection', 'name theme')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ChessPiece.countDocuments(query);

        console.log(`✅ Found ${chessPieces.length} chess pieces (Total: ${total})`);

        res.json({
            success: true,
            chessPieces,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('❌ Error getting chess pieces:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy quân cờ',
            error: error.message
        });
    }
};
