import mongoose from 'mongoose';

const chessPieceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['xe', 'hậu', 'mã', 'tượng', 'tốt', 'vua']
  },
  collection: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  model3D: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(images: string[]) {
        return images.length <= 4;
      },
      message: 'Maximum 4 images allowed'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
chessPieceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ChessPiece = mongoose.models.ChessPiece || mongoose.model('ChessPiece', chessPieceSchema);

export default ChessPiece;
