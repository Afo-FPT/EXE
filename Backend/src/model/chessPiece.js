import mongoose from "mongoose";

const chessPieceSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    }, // Tên quân cờ: xe, hậu, mã, v.v.
    
    type: { 
        type: String, 
        required: true, 
        enum: ['xe', 'hậu', 'mã', 'tượng', 'tốt', 'vua'] 
    }, // Loại quân cờ
    
    rarity: { 
        type: String, 
        required: true, 
        enum: ['common', 'rare', 'epic', 'legendary'], 
        default: 'common' 
    }, // Độ hiếm
    
    image: { 
        type: String, 
        required: true 
    }, // URL hình ảnh quân cờ
    
    model3D: { 
        type: String, 
        default: '' 
    }, // URL file 3D model (.obj, .glb, .gltf)
    
    description: { 
        type: String, 
        default: '' 
    }, // Mô tả quân cờ
    
    dropRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 10
    }, // Tỷ lệ rơi (%), càng hiếm càng thấp
    
    collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true
    }, // Collection chứa quân cờ này
    
    isActive: {
        type: Boolean,
        default: true
    }, // Trạng thái hoạt động
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    } // Admin tạo quân cờ
}, { 
    timestamps: true, 
    versionKey: false 
});

// Index để tìm kiếm nhanh
chessPieceSchema.index({ type: 1, rarity: 1, collection: 1, isActive: 1 });
chessPieceSchema.index({ dropRate: 1 });

export default mongoose.model('ChessPiece', chessPieceSchema);
