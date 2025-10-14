import Joi from 'joi';

export const productSchema = Joi.object({
    type: Joi.string().valid('Xe', 'Tượng', 'Mã', 'Vua', 'Hậu').required().messages({
        'any.required': 'Loại quân cờ là bắt buộc',
        'any.only': 'Loại quân cờ không hợp lệ'
    }),
    name: Joi.string().required().messages({
        'any.required': 'Tên quân cờ là bắt buộc',
        'string.empty': 'Tên quân cờ không được để trống'
    }),
    rarity: Joi.string().required().messages({
        'any.required': 'Độ hiếm là bắt buộc',
        'string.empty': 'Độ hiếm không được để trống'
    }),
    image: Joi.string().required().messages({
        'any.required': 'Hình ảnh là bắt buộc',
        'string.empty': 'Hình ảnh không được để trống'
    })
});

export const mysteryBagSchema = Joi.object({
    name: Joi.string().required().trim().messages({
        'any.required': 'Tên túi mù là bắt buộc',
        'string.empty': 'Tên túi mù không được để trống'
    }),
    collection: Joi.alternatives().try(
        Joi.string().required().trim().messages({
            'any.required': 'Tên bộ sưu tập là bắt buộc',
            'string.empty': 'Tên bộ sưu tập không được để trống'
        }),
        Joi.object().messages({
            'object.base': 'Collection phải là ObjectId hợp lệ'
        })
    ).required().messages({
        'any.required': 'Tên bộ sưu tập là bắt buộc'
    }),
    description: Joi.string().required().trim().messages({
        'any.required': 'Mô tả là bắt buộc',
        'string.empty': 'Mô tả không được để trống'
    }),
    price: Joi.number().required().min(0).messages({
        'any.required': 'Giá là bắt buộc',
        'number.min': 'Giá phải lớn hơn hoặc bằng 0'
    }),
    discountPercent: Joi.number().min(0).max(100).default(0).messages({
        'number.min': 'Phần trăm giảm giá phải từ 0-100',
        'number.max': 'Phần trăm giảm giá phải từ 0-100'
    }),
    image: Joi.string().messages({
        'string.empty': 'Hình ảnh không được để trống'
    }),
    isActive: Joi.boolean().default(true),
    stock: Joi.number().min(0).default(0).messages({
        'number.min': 'Số lượng tồn kho phải lớn hơn hoặc bằng 0'
    })
}); 