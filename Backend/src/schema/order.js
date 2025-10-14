import Joi from 'joi';

// Schema for order item validation
export const orderItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    'any.required': 'ID sản phẩm là bắt buộc',
    'string.empty': 'ID sản phẩm không được để trống'
  }),
  productName: Joi.string().required().trim().messages({
    'any.required': 'Tên sản phẩm là bắt buộc',
    'string.empty': 'Tên sản phẩm không được để trống'
  }),
  productImage: Joi.string().required().trim().messages({
    'any.required': 'Hình ảnh sản phẩm là bắt buộc',
    'string.empty': 'Hình ảnh sản phẩm không được để trống'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Số lượng là bắt buộc',
    'number.base': 'Số lượng phải là số',
    'number.integer': 'Số lượng phải là số nguyên',
    'number.min': 'Số lượng phải lớn hơn 0'
  }),
  price: Joi.number().min(0).required().messages({
    'any.required': 'Giá sản phẩm là bắt buộc',
    'number.base': 'Giá sản phẩm phải là số',
    'number.min': 'Giá sản phẩm phải lớn hơn hoặc bằng 0'
  }),
  discountPercent: Joi.number().min(0).max(100).default(0).messages({
    'number.base': 'Phần trăm giảm giá phải là số',
    'number.min': 'Phần trăm giảm giá phải lớn hơn hoặc bằng 0',
    'number.max': 'Phần trăm giảm giá không được vượt quá 100'
  }),
  totalPrice: Joi.number().min(0).required().messages({
    'any.required': 'Tổng giá sản phẩm là bắt buộc',
    'number.base': 'Tổng giá sản phẩm phải là số',
    'number.min': 'Tổng giá sản phẩm phải lớn hơn hoặc bằng 0'
  })
});

// Schema for customer information validation
export const customerSchema = Joi.object({
  userId: Joi.string().required().messages({
    'any.required': 'ID người dùng là bắt buộc',
    'string.empty': 'ID người dùng không được để trống'
  }),
  fullName: Joi.string().required().trim().min(2).max(100).messages({
    'any.required': 'Họ và tên là bắt buộc',
    'string.empty': 'Họ và tên không được để trống',
    'string.min': 'Họ và tên phải có ít nhất 2 ký tự',
    'string.max': 'Họ và tên không được vượt quá 100 ký tự'
  }),
  email: Joi.string().email().required().trim().lowercase().messages({
    'any.required': 'Email là bắt buộc',
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không hợp lệ'
  }),
  phone: Joi.string().required().trim().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).messages({
    'any.required': 'Số điện thoại là bắt buộc',
    'string.empty': 'Số điện thoại không được để trống',
    'string.pattern.base': 'Số điện thoại không hợp lệ',
    'string.min': 'Số điện thoại phải có ít nhất 10 ký tự',
    'string.max': 'Số điện thoại không được vượt quá 15 ký tự'
  })
});

// Schema for shipping information validation
export const shippingSchema = Joi.object({
  address: Joi.string().required().trim().min(5).max(200).messages({
    'any.required': 'Địa chỉ là bắt buộc',
    'string.empty': 'Địa chỉ không được để trống',
    'string.min': 'Địa chỉ phải có ít nhất 5 ký tự',
    'string.max': 'Địa chỉ không được vượt quá 200 ký tự'
  }),
  city: Joi.string().required().trim().min(2).max(50).messages({
    'any.required': 'Tỉnh/Thành phố là bắt buộc',
    'string.empty': 'Tỉnh/Thành phố không được để trống',
    'string.min': 'Tỉnh/Thành phố phải có ít nhất 2 ký tự',
    'string.max': 'Tỉnh/Thành phố không được vượt quá 50 ký tự'
  }),
  district: Joi.string().required().trim().min(2).max(50).messages({
    'any.required': 'Quận/Huyện là bắt buộc',
    'string.empty': 'Quận/Huyện không được để trống',
    'string.min': 'Quận/Huyện phải có ít nhất 2 ký tự',
    'string.max': 'Quận/Huyện không được vượt quá 50 ký tự'
  }),
  ward: Joi.string().required().trim().min(2).max(50).messages({
    'any.required': 'Phường/Xã là bắt buộc',
    'string.empty': 'Phường/Xã không được để trống',
    'string.min': 'Phường/Xã phải có ít nhất 2 ký tự',
    'string.max': 'Phường/Xã không được vượt quá 50 ký tự'
  })
});

// Schema for payment information validation
export const paymentSchema = Joi.object({
  method: Joi.string().valid('cod', 'bank_transfer', 'momo').required().messages({
    'any.required': 'Phương thức thanh toán là bắt buộc',
    'any.only': 'Phương thức thanh toán không hợp lệ'
  }),
  amount: Joi.number().min(0).required().messages({
    'any.required': 'Số tiền thanh toán là bắt buộc',
    'number.base': 'Số tiền thanh toán phải là số',
    'number.min': 'Số tiền thanh toán phải lớn hơn hoặc bằng 0'
  }),
  status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending').messages({
    'any.only': 'Trạng thái thanh toán không hợp lệ'
  }),
  transactionId: Joi.string().trim().allow('').messages({
    'string.base': 'Mã giao dịch phải là chuỗi'
  })
});

// Main order schema validation
export const orderSchema = Joi.object({
  customer: customerSchema.required().messages({
    'any.required': 'Thông tin khách hàng là bắt buộc'
  }),
  shipping: shippingSchema.required().messages({
    'any.required': 'Thông tin giao hàng là bắt buộc'
  }),
  payment: paymentSchema.required().messages({
    'any.required': 'Thông tin thanh toán là bắt buộc'
  }),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    'any.required': 'Danh sách sản phẩm là bắt buộc',
    'array.min': 'Đơn hàng phải có ít nhất 1 sản phẩm'
  }),
  totalAmount: Joi.number().min(0).required().messages({
    'any.required': 'Tổng tiền là bắt buộc',
    'number.base': 'Tổng tiền phải là số',
    'number.min': 'Tổng tiền phải lớn hơn hoặc bằng 0'
  }),
  totalItems: Joi.number().integer().min(1).required().messages({
    'any.required': 'Tổng số sản phẩm là bắt buộc',
    'number.base': 'Tổng số sản phẩm phải là số',
    'number.integer': 'Tổng số sản phẩm phải là số nguyên',
    'number.min': 'Tổng số sản phẩm phải lớn hơn 0'
  }),
  totalDiscount: Joi.number().min(0).default(0).messages({
    'number.base': 'Tổng giảm giá phải là số',
    'number.min': 'Tổng giảm giá phải lớn hơn hoặc bằng 0'
  }),
  finalAmount: Joi.number().min(0).required().messages({
    'any.required': 'Tổng tiền cuối cùng là bắt buộc',
    'number.base': 'Tổng tiền cuối cùng phải là số',
    'number.min': 'Tổng tiền cuối cùng phải lớn hơn hoặc bằng 0'
  }),
  status: Joi.string().valid(
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  ).default('pending').messages({
    'any.only': 'Trạng thái đơn hàng không hợp lệ'
  }),
  notes: Joi.string().trim().allow('').max(500).messages({
    'string.max': 'Ghi chú không được vượt quá 500 ký tự'
  }),
  adminNotes: Joi.string().trim().allow('').max(500).messages({
    'string.max': 'Ghi chú admin không được vượt quá 500 ký tự'
  })
});

// Schema for updating order status
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  ).required().messages({
    'any.required': 'Trạng thái đơn hàng là bắt buộc',
    'any.only': 'Trạng thái đơn hàng không hợp lệ'
  }),
  adminNotes: Joi.string().trim().allow('').max(500).messages({
    'string.max': 'Ghi chú admin không được vượt quá 500 ký tự'
  }),
  shippingInfo: Joi.object({
    trackingNumber: Joi.string().trim().allow('').max(50).messages({
      'string.max': 'Mã vận đơn không được vượt quá 50 ký tự'
    }),
    shippingCompany: Joi.string().trim().allow('').max(100).messages({
      'string.max': 'Tên công ty vận chuyển không được vượt quá 100 ký tự'
    }),
    estimatedDelivery: Joi.date().allow(null).messages({
      'date.base': 'Ngày giao hàng dự kiến không hợp lệ'
    })
  }).optional()
});

// Schema for updating payment status
export const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').required().messages({
    'any.required': 'Trạng thái thanh toán là bắt buộc',
    'any.only': 'Trạng thái thanh toán không hợp lệ'
  }),
  transactionId: Joi.string().trim().allow('').max(100).messages({
    'string.max': 'Mã giao dịch không được vượt quá 100 ký tự'
  }),
  adminNotes: Joi.string().trim().allow('').max(500).messages({
    'string.max': 'Ghi chú admin không được vượt quá 500 ký tự'
  })
});

// Schema for order query parameters
export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Trang phải là số',
    'number.integer': 'Trang phải là số nguyên',
    'number.min': 'Trang phải lớn hơn 0'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Số lượng mỗi trang phải là số',
    'number.integer': 'Số lượng mỗi trang phải là số nguyên',
    'number.min': 'Số lượng mỗi trang phải lớn hơn 0',
    'number.max': 'Số lượng mỗi trang không được vượt quá 100'
  }),
  status: Joi.string().valid(
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  ).optional().messages({
    'any.only': 'Trạng thái đơn hàng không hợp lệ'
  }),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional().messages({
    'any.only': 'Trạng thái thanh toán không hợp lệ'
  }),
  paymentMethod: Joi.string().valid('cod', 'bank_transfer', 'momo').optional().messages({
    'any.only': 'Phương thức thanh toán không hợp lệ'
  }),
  search: Joi.string().trim().allow('').max(100).optional().messages({
    'string.max': 'Từ khóa tìm kiếm không được vượt quá 100 ký tự'
  }),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'finalAmount', 'status').default('createdAt').messages({
    'any.only': 'Trường sắp xếp không hợp lệ'
  }),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Thứ tự sắp xếp không hợp lệ'
  })
});
