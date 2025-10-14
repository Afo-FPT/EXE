import { Order } from '../model/order.js';
import { orderSchema, updateOrderStatusSchema, updatePaymentStatusSchema, orderQuerySchema } from '../schema/order.js';
import { MysteryBag } from '../model/product.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    console.log('📦 Create Order Request Body:', req.body);
    
    // Validate request body
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      console.error('❌ Order validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.details.map(detail => detail.message)
      });
    }

    const orderData = value;
    console.log('✅ Validated order data:', orderData);

    // Create new order
    const order = new Order(orderData);
    await order.save();

    console.log('✅ Order created successfully:', order._id);

    res.status(201).json({
      success: true,
      message: 'Đơn hàng được tạo thành công',
      data: order
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
    });
  }
};

// Get all orders (with pagination and filtering)
export const getOrders = async (req, res) => {
  try {
    console.log('📋 Get Orders Query:', req.query);
    
    // Validate query parameters
    const { error, value } = orderQuerySchema.validate(req.query);
    if (error) {
      console.error('❌ Query validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Tham số truy vấn không hợp lệ',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { page, limit, status, paymentStatus, paymentMethod, search, sortBy, sortOrder } = value;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter['payment.status'] = paymentStatus;
    if (paymentMethod) filter['payment.method'] = paymentMethod;
    if (search) {
      filter.$or = [
        { 'customer.fullName': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    console.log('🔍 Filter:', filter);
    console.log('📊 Sort:', sort);

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer.userId', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Found ${orders.length} orders out of ${total} total`);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Get Order by ID:', id);

    const order = await Order.findById(id)
      .populate('customer.userId', 'username email')
      .lean();

    if (!order) {
      console.log('❌ Order not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    console.log('✅ Order found:', order._id);

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 Update Order Status:', id, req.body);
    
    // Validate request body
    const { error, value } = updateOrderStatusSchema.validate(req.body);
    if (error) {
      console.error('❌ Update status validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { status, adminNotes, shippingInfo } = value;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      console.log('❌ Order not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Update order status
    await order.updateStatus(status, adminNotes);

    // Update shipping info if provided
    if (shippingInfo) {
      if (shippingInfo.trackingNumber) {
        order.shippingInfo.trackingNumber = shippingInfo.trackingNumber;
      }
      if (shippingInfo.shippingCompany) {
        order.shippingInfo.shippingCompany = shippingInfo.shippingCompany;
      }
      if (shippingInfo.estimatedDelivery) {
        order.shippingInfo.estimatedDelivery = shippingInfo.estimatedDelivery;
      }
      await order.save();
    }

    console.log('✅ Order status updated:', id, 'to', status);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });

  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('💳 Update Payment Status:', id, req.body);
    
    // Validate request body
    const { error, value } = updatePaymentStatusSchema.validate(req.body);
    if (error) {
      console.error('❌ Update payment validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { paymentStatus, transactionId, adminNotes } = value;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      console.log('❌ Order not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Update payment status
    order.payment.status = paymentStatus;
    if (transactionId) {
      order.payment.transactionId = transactionId;
    }
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }
    
    // Set paidAt timestamp if payment is completed
    if (paymentStatus === 'paid') {
      order.payment.paidAt = new Date();
    }

    await order.save();

    console.log('✅ Payment status updated:', id, 'to', paymentStatus);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: order
    });

  } catch (error) {
    console.error('❌ Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái thanh toán',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
    });
  }
};

// Get order statistics
export const getOrderStatistics = async (req, res) => {
  try {
    console.log('📊 Get Order Statistics');
    
    const stats = await Order.getStatistics();
    
    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo }
    }).countDocuments();

    // Get monthly revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth },
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' }
        }
      }
    ]);

    const statsWithExtras = {
      ...stats,
      recentOrders,
      monthlyRevenue: monthlyRevenue[0]?.totalRevenue || 0
    };

    console.log('✅ Order statistics:', statsWithExtras);

    res.json({
      success: true,
      data: statsWithExtras
    });

  } catch (error) {
    console.error('❌ Get order statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
    });
  }
};

// Delete order (soft delete by setting status to cancelled)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete Order:', id);
    
    const order = await Order.findById(id);
    if (!order) {
      console.log('❌ Order not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Soft delete by setting status to cancelled
    await order.updateStatus('cancelled', 'Đơn hàng bị xóa bởi admin');

    console.log('✅ Order deleted (cancelled):', id);

    res.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });

  } catch (error) {
    console.error('❌ Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Đã xảy ra lỗi'
    });
  }
};
