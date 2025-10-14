import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Thông tin khách hàng
  customer: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },

  // Thông tin giao hàng
  shipping: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    ward: {
      type: String,
      required: true,
      trim: true
    }
  },

  // Thông tin thanh toán
  payment: {
    method: {
      type: String,
      enum: ['cod', 'bank_transfer', 'momo'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: {
      type: Date
    },
    transactionId: {
      type: String,
      trim: true
    }
  },

  // Sản phẩm trong đơn hàng
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MysteryBag',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productImage: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],

  // Tổng quan đơn hàng
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalItems: {
    type: Number,
    required: true,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: [
      'pending',      // Chờ xử lý
      'confirmed',    // Đã xác nhận
      'processing',   // Đang xử lý
      'shipped',      // Đã giao hàng
      'delivered',    // Đã nhận hàng
      'cancelled',    // Đã hủy
      'refunded'      // Đã hoàn tiền
    ],
    default: 'pending'
  },

  // Ghi chú
  notes: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },

  // Thông tin giao hàng
  shippingInfo: {
    trackingNumber: {
      type: String,
      trim: true
    },
    shippingCompany: {
      type: String,
      trim: true
    },
    estimatedDelivery: {
      type: Date
    },
    actualDelivery: {
      type: Date
    }
  },

  // Thời gian
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ 'customer.userId': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });

// Virtual for formatted order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware to update timestamps
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.totalDiscount = this.items.reduce((sum, item) => {
    const discountAmount = item.price * (item.discountPercent / 100);
    return sum + (discountAmount * item.quantity);
  }, 0);
  this.finalAmount = this.totalAmount - this.totalDiscount;
  return this;
};

// Method to update status with timestamp
orderSchema.methods.updateStatus = function(newStatus, adminNotes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  this.adminNotes = adminNotes;
  
  // Set timestamp based on status
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = new Date();
      break;
    case 'shipped':
      this.shippedAt = new Date();
      break;
    case 'delivered':
      this.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
  }
  
  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$finalAmount' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  };
};

export const Order = mongoose.model('Order', orderSchema);
