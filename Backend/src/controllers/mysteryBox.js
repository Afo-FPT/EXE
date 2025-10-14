import Collection from '../model/collection.js';
import ChessPiece from '../model/chessPiece.js';
import UserInventory from '../model/userInventory.js';

// Mở hộp mystery box
export const openMysteryBox = async (req, res) => {
    try {
        console.log('🎁 Opening mystery box...');
        console.log('👤 User ID:', req.user.id);
        console.log('🎯 Collection ID:', req.params.collectionId);

        const { collectionId } = req.params;
        const userId = req.user.id;

        // Kiểm tra collection tồn tại và active
        const collection = await Collection.findById(collectionId);
        if (!collection) {
            console.log('❌ Collection not found:', collectionId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy collection!'
            });
        }

        if (!collection.isActive) {
            console.log('❌ Collection is not active:', collection.name);
            return res.status(400).json({
                success: false,
                message: 'Collection này không hoạt động!'
            });
        }

        // Lấy tất cả quân cờ trong collection
        const chessPieces = await ChessPiece.find({ 
            collection: collectionId, 
            isActive: true 
        });

        if (chessPieces.length === 0) {
            console.log('❌ No chess pieces in collection:', collection.name);
            return res.status(400).json({
                success: false,
                message: 'Collection này chưa có quân cờ nào!'
            });
        }

        console.log(`📋 Found ${chessPieces.length} chess pieces in collection`);

        // Cập nhật thống kê collection nếu cần
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
            console.log('✅ Updated collection statistics');
        }

        // Tính toán quân cờ nhận được dựa trên dropRate
        const wonChessPiece = calculateWonChessPiece(chessPieces);
        console.log('🎉 Won chess piece:', wonChessPiece.name, 'Rarity:', wonChessPiece.rarity);

        // Tìm hoặc tạo user inventory
        let userInventory = await UserInventory.findOne({ user: userId });
        if (!userInventory) {
            console.log('📦 Creating new user inventory for user:', userId);
            userInventory = new UserInventory({ user: userId });
        }

        // Thêm quân cờ vào inventory
        const inventoryItem = {
            chessPiece: wonChessPiece._id,
            collection: collectionId,
            obtainedAt: new Date(),
            isEquipped: false,
            isFavorite: false,
            condition: 'new',
            level: 1,
            experience: 0
        };

        userInventory.items.push(inventoryItem);
        userInventory.lastOpenedBox = new Date();
        userInventory.boxesOpened += 1;

        // Cập nhật thống kê
        userInventory.statistics.totalCollectionsOpened += 1;
        userInventory.statistics.totalRarityCount[wonChessPiece.rarity] += 1;

        // Cập nhật chuỗi mở hộp
        const now = new Date();
        const lastOpened = userInventory.lastOpenedBox;
        if (lastOpened && isSameDay(now, lastOpened)) {
            userInventory.statistics.currentStreak += 1;
        } else {
            userInventory.statistics.currentStreak = 1;
        }
        
        if (userInventory.statistics.currentStreak > userInventory.statistics.longestStreak) {
            userInventory.statistics.longestStreak = userInventory.statistics.currentStreak;
        }

        await userInventory.save();

        console.log('✅ Inventory updated successfully');

        // Tạo response object với thông tin đầy đủ
        const wonItem = {
            chessPiece: {
                _id: wonChessPiece._id,
                name: wonChessPiece.name,
                type: wonChessPiece.type,
                rarity: wonChessPiece.rarity,
                image: wonChessPiece.image,
                description: wonChessPiece.description
            },
            collection: {
                _id: collection._id,
                name: collection.name,
                theme: collection.theme
            },
            obtainedAt: inventoryItem.obtainedAt,
            level: inventoryItem.level,
            experience: inventoryItem.experience
        };

        res.json({
            success: true,
            message: 'Mở hộp thành công!',
            wonItem: wonItem,
            inventoryStats: {
                totalItems: userInventory.totalItems,
                boxesOpened: userInventory.boxesOpened,
                lastOpenedBox: userInventory.lastOpenedBox
            }
        });

    } catch (error) {
        console.error('❌ Error opening mystery box:', error);
        
        // Kiểm tra loại lỗi và trả về message phù hợp
        let errorMessage = 'Lỗi server khi mở hộp';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Dữ liệu không hợp lệ';
        } else if (error.name === 'CastError') {
            errorMessage = 'ID không hợp lệ';
        } else if (error.code === 11000) {
            errorMessage = 'Dữ liệu đã tồn tại';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
        });
    }
};

// Lấy inventory của user
export const getUserInventory = async (req, res) => {
    try {
        console.log('📦 Getting user inventory for user:', req.user.id);

        const userInventory = await UserInventory.findOne({ user: req.user.id })
            .populate({
                path: 'items.chessPiece',
                select: 'name type rarity image model3D description'
            })
            .populate({
                path: 'items.collection',
                select: 'name theme coverImage'
            });

        if (!userInventory) {
            console.log('📦 No inventory found, creating new one');
            return res.json({
                success: true,
                items: [],
                totalItems: 0,
                boxesOpened: 0,
                statistics: {
                    totalCollectionsOpened: 0,
                    totalRarityCount: { common: 0, rare: 0, epic: 0, legendary: 0 },
                    longestStreak: 0,
                    currentStreak: 0
                }
            });
        }

        console.log(`✅ Found ${userInventory.items.length} items in inventory`);
        
        // Log items before filtering
        console.log('🔍 Items before filtering:', userInventory.items.map(item => ({
            id: item._id,
            hasChessPiece: !!item.chessPiece,
            hasCollection: !!item.collection,
            chessPieceId: item.chessPiece?._id,
            collectionId: item.collection?._id
        })));

        // Transform data to match frontend expectations
        const transformedItems = userInventory.items
            .filter(item => item.chessPiece && item.collection) // Filter out items with missing references
            .map(item => ({
                _id: item._id,
                chessPiece: {
                    name: item.chessPiece.name,
                    type: item.chessPiece.type,
                    rarity: item.chessPiece.rarity,
                    image: item.chessPiece.image,
                    model3D: item.chessPiece.model3D,
                    description: item.chessPiece.description
                },
                collection: {
                    name: item.collection.name,
                    theme: item.collection.theme
                },
                obtainedAt: item.obtainedAt,
                isEquipped: item.isEquipped,
                isFavorite: item.isFavorite,
                condition: item.condition || 'new',
                level: item.level || 1,
                experience: item.experience || 0
            }));

        console.log(`✅ Transformed ${transformedItems.length} items successfully`);

        res.json({
            success: true,
            items: transformedItems,
            totalItems: userInventory.totalItems,
            boxesOpened: userInventory.boxesOpened,
            statistics: userInventory.statistics
        });

    } catch (error) {
        console.error('❌ Error getting user inventory:', error);
        
        let errorMessage = 'Lỗi server khi lấy inventory';
        
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

// Lấy thống kê inventory
export const getInventoryStats = async (req, res) => {
    try {
        console.log('📊 Getting inventory stats for user:', req.user.id);

        const userInventory = await UserInventory.findOne({ user: req.user.id });
        
        if (!userInventory) {
            console.log('📊 No inventory found, returning default stats');
            return res.json({
                success: true,
                totalItems: 0,
                boxesOpened: 0,
                lastOpenedBox: null,
                rarityStats: { common: 0, rare: 0, epic: 0, legendary: 0 },
                typeStats: { xe: 0, hậu: 0, mã: 0, tượng: 0, tốt: 0, vua: 0 },
                equippedItems: 0,
                favoriteItems: 0,
                statistics: {
                    totalCollectionsOpened: 0,
                    totalRarityCount: { common: 0, rare: 0, epic: 0, legendary: 0 },
                    longestStreak: 0,
                    currentStreak: 0
                }
            });
        }

        console.log('✅ Inventory stats retrieved successfully');

        // Calculate rarity and type stats
        const rarityStats = { common: 0, rare: 0, epic: 0, legendary: 0 };
        const typeStats = { xe: 0, hậu: 0, mã: 0, tượng: 0, tốt: 0, vua: 0 };
        let equippedItems = 0;
        let favoriteItems = 0;

        // Populate chessPiece để lấy thông tin chi tiết
        await userInventory.populate('items.chessPiece', 'rarity type');

        userInventory.items.forEach(item => {
            if (item.chessPiece) {
                // Count by rarity
                if (item.chessPiece.rarity && rarityStats.hasOwnProperty(item.chessPiece.rarity)) {
                    rarityStats[item.chessPiece.rarity]++;
                }
                
                // Count by type
                if (item.chessPiece.type && typeStats.hasOwnProperty(item.chessPiece.type)) {
                    typeStats[item.chessPiece.type]++;
                }
                
                // Count equipped and favorite
                if (item.isEquipped) equippedItems++;
                if (item.isFavorite) favoriteItems++;
            }
        });

        res.json({
            success: true,
            totalItems: userInventory.totalItems,
            boxesOpened: userInventory.boxesOpened,
            lastOpenedBox: userInventory.lastOpenedBox,
            rarityStats,
            typeStats,
            equippedItems,
            favoriteItems,
            statistics: userInventory.statistics
        });

    } catch (error) {
        console.error('❌ Error getting inventory stats:', error);
        
        let errorMessage = 'Lỗi server khi lấy thống kê inventory';
        
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

// Toggle yêu thích item
export const toggleFavoriteItem = async (req, res) => {
    try {
        console.log('❤️ Toggling favorite for item:', req.params.itemId);

        const userInventory = await UserInventory.findOne({ user: req.user.id });
        if (!userInventory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy inventory!'
            });
        }

        const item = userInventory.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy item!'
            });
        }

        item.isFavorite = !item.isFavorite;
        
        if (item.isFavorite) {
            if (!userInventory.favoriteItems.includes(item._id)) {
                userInventory.favoriteItems.push(item._id);
            }
        } else {
            userInventory.favoriteItems = userInventory.favoriteItems.filter(
                id => id.toString() !== item._id.toString()
            );
        }

        await userInventory.save();

        console.log('✅ Favorite toggled successfully');

        res.json({
            success: true,
            message: item.isFavorite ? 'Đã thêm vào yêu thích!' : 'Đã bỏ khỏi yêu thích!',
            isFavorite: item.isFavorite
        });

    } catch (error) {
        console.error('❌ Error toggling favorite:', error);
        
        let errorMessage = 'Lỗi server khi thay đổi yêu thích';
        
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

// Toggle trang bị item
export const toggleEquipItem = async (req, res) => {
    try {
        console.log('⚔️ Toggling equip for item:', req.params.itemId);

        const userInventory = await UserInventory.findOne({ user: req.user.id });
        if (!userInventory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy inventory!'
            });
        }

        const item = userInventory.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy item!'
            });
        }

        // Populate chessPiece để lấy type
        await item.populate('chessPiece', 'type');
        const pieceType = item.chessPiece.type;

        // Nếu item đang được trang bị, bỏ trang bị
        if (item.isEquipped) {
            item.isEquipped = false;
            userInventory.equippedItems[pieceType] = null;
        } else {
            // Bỏ trang bị item cũ cùng loại
            const oldEquippedItem = userInventory.items.find(
                i => i.isEquipped && i.chessPiece.type === pieceType
            );
            if (oldEquippedItem) {
                oldEquippedItem.isEquipped = false;
            }
            
            // Trang bị item mới
            item.isEquipped = true;
            userInventory.equippedItems[pieceType] = item._id;
        }

        await userInventory.save();

        console.log('✅ Equip toggled successfully');

        res.json({
            success: true,
            message: item.isEquipped ? 'Đã trang bị!' : 'Đã bỏ trang bị!',
            isEquipped: item.isEquipped
        });

    } catch (error) {
        console.error('❌ Error toggling equip:', error);
        
        let errorMessage = 'Lỗi server khi thay đổi trang bị';
        
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

// Lấy leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        console.log('🏆 Getting leaderboard...');

        const leaderboard = await UserInventory.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    username: '$userInfo.username',
                    totalItems: '$totalItems',
                    boxesOpened: '$boxesOpened',
                    legendaryCount: '$statistics.totalRarityCount.legendary',
                    epicCount: '$statistics.totalRarityCount.epic',
                    rareCount: '$statistics.totalRarityCount.rare',
                    commonCount: '$statistics.totalRarityCount.common'
                }
            },
            {
                $sort: { 
                    legendaryCount: -1, 
                    epicCount: -1, 
                    rareCount: -1, 
                    totalItems: -1 
                }
            },
            {
                $limit: 10
            }
        ]);

        console.log(`✅ Leaderboard generated with ${leaderboard.length} users`);

        res.json({
            success: true,
            leaderboard
        });

    } catch (error) {
        console.error('❌ Error getting leaderboard:', error);
        
        let errorMessage = 'Lỗi server khi lấy leaderboard';
        
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

// Helper functions
function calculateWonChessPiece(chessPieces) {
    // Tính tổng dropRate
    const totalDropRate = chessPieces.reduce((sum, piece) => sum + piece.dropRate, 0);
    
    // Random số từ 0 đến totalDropRate
    const random = Math.random() * totalDropRate;
    
    let currentSum = 0;
    for (const piece of chessPieces) {
        currentSum += piece.dropRate;
        if (random <= currentSum) {
            return piece;
        }
    }
    
    // Fallback: trả về quân cờ cuối cùng
    return chessPieces[chessPieces.length - 1];
}

function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}
