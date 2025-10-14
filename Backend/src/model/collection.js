import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    }, // Tên bộ sưu tập: "Văn Lang", "Đại Việt", v.v.
    
    description: { 
        type: String, 
        default: '' 
    }, // Mô tả bộ sưu tập
    
    coverImage: { 
        type: String, 
        required: true 
    }, // Ảnh bìa bộ sưu tập
    
    theme: { 
        type: String, 
        default: 'vietnam' 
    }, // Chủ đề bộ sưu tập
    
    isActive: { 
        type: Boolean, 
        default: true 
    }, // Trạng thái hoạt động
    
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Admin tạo bộ sưu tập
    
    releaseDate: { 
        type: Date, 
        default: Date.now 
    }, // Ngày phát hành
    
    endDate: { 
        type: Date 
    }, // Ngày kết thúc (nếu có)
    
    totalChessPieces: {
        type: Number,
        default: 0
    }, // Tổng số quân cờ trong bộ sưu tập
    
    rarityDistribution: {
        common: { type: Number, default: 0 },
        rare: { type: Number, default: 0 },
        epic: { type: Number, default: 0 },
        legendary: { type: Number, default: 0 }
    } // Phân bố độ hiếm của quân cờ
}, { 
    timestamps: true, 
    versionKey: false 
});

// Index để tìm kiếm nhanh
collectionSchema.index({ name: 1, theme: 1, isActive: 1 });
collectionSchema.index({ releaseDate: 1 });

export default mongoose.model('Collection', collectionSchema);
