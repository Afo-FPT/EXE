import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
  chessPiece: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChessPiece',
    required: true
  }, // Reference đến quân cờ đã mở được
  
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  }, // Collection chứa quân cờ này
  
  obtainedAt: { 
    type: Date, 
    default: Date.now 
  }, // Thời gian mở được
  
  isEquipped: { 
    type: Boolean, 
    default: false 
  }, // Đã trang bị chưa
  
  isFavorite: { 
    type: Boolean, 
    default: false 
  }, // Đã yêu thích chưa
  
  condition: { 
    type: String, 
    enum: ['new', 'good', 'worn', 'damaged'], 
    default: 'new' 
  }, // Tình trạng quân cờ
  
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  }, // Cấp độ quân cờ
  
  experience: {
    type: Number,
    default: 0,
    min: 0
  } // Kinh nghiệm quân cờ
}, { timestamps: true });

const userInventorySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  }, // User sở hữu inventory
  
  items: [inventoryItemSchema], // Danh sách quân cờ đã mở được
  
  totalItems: { 
    type: Number, 
    default: 0 
  }, // Tổng số quân cờ
  
  totalValue: { 
    type: Number, 
    default: 0 
  }, // Tổng giá trị inventory
  
  lastOpenedBox: { 
    type: Date 
  }, // Lần cuối mở hộp
  
  boxesOpened: { 
    type: Number, 
    default: 0 
  }, // Tổng số hộp đã mở
  
  favoriteItems: [{ 
    type: mongoose.Schema.Types.ObjectId 
  }], // Danh sách quân cờ yêu thích
  
  equippedItems: {
    xe: { type: mongoose.Schema.Types.ObjectId, default: null },
    hậu: { type: mongoose.Schema.Types.ObjectId, default: null },
    mã: { type: mongoose.Schema.Types.ObjectId, default: null },
    tượng: { type: mongoose.Schema.Types.ObjectId, default: null },
    tốt: { type: mongoose.Schema.Types.ObjectId, default: null },
    vua: { type: mongoose.Schema.Types.ObjectId, default: null }
  }, // Quân cờ đang được trang bị
  
  statistics: {
    totalCollectionsOpened: { type: Number, default: 0 }, // Tổng số collection đã mở
    totalRarityCount: {
      common: { type: Number, default: 0 },
      rare: { type: Number, default: 0 },
      epic: { type: Number, default: 0 },
      legendary: { type: Number, default: 0 }
    }, // Thống kê theo độ hiếm
    longestStreak: { type: Number, default: 0 }, // Chuỗi mở hộp dài nhất
    currentStreak: { type: Number, default: 0 } // Chuỗi hiện tại
  }
}, { timestamps: true });

// Middleware để tự động cập nhật totalItems
userInventorySchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  next();
});

export default mongoose.model('UserInventory', userInventorySchema);
