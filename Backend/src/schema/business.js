import Joi from 'joi';

export const businessSchema = Joi.object({
    businessName: Joi.string().required().trim().messages({
        "any.required": "Tên doanh nghiệp là bắt buộc",
        "string.empty": "Tên doanh nghiệp không được để trống",
    }),
    taxCode: Joi.string().required().messages({
        "any.required": "Mã số thuế là bắt buộc",
        "string.empty": "Mã số thuế không được để trống",
    }),
    email: Joi.string().email().required().messages({
        "string.email" : "Email không hợp lệ",
        "any.required": "Email là bắt buộc",
        "string.empty": "Email không được để trống",
    }),
    password: Joi.string().min(6).required().messages({
        "any.required":"Mật khẩu là bắt buộc",
        "string.min": "Mật khẩu cần ít nhất 6 kí tự",
        "string.empty": "Mật khẩu không được để trống",
    }),
    confirmpassword: Joi.string().required().valid(Joi.ref('password'))
        .error(errors => {
            errors.forEach(err => {
                if (err.code === "any.only") {
                    err.message = "Mật khẩu xác nhận không khớp";
                }
                if (err.code === "any.required") {
                    err.message = "Mật khẩu xác nhận là bắt buộc";
                }
                if (err.code === "string.empty") {
                    err.message = "Mật khẩu xác nhận không được để trống";
                }
            });
            return errors;
        }),
    phone: Joi.string().required().messages({
        "any.required": "Số điện thoại là bắt buộc",
        "string.empty": "Số điện thoại không được để trống",
    }),
    address: Joi.string().required().messages({
        "any.required": "Địa chỉ là bắt buộc",
        "string.empty": "Địa chỉ không được để trống",
    }),
    scale: Joi.string().required().messages({
        "any.required": "Quy mô là bắt buộc",
        "string.empty": "Quy mô không được để trống",
    }),
    capital: Joi.string().required().messages({
        "any.required": "Vốn điều lệ là bắt buộc",
        "string.empty": "Vốn điều lệ không được để trống",
    }),
    website: Joi.string().uri().optional().allow('').messages({
        "string.uri": "Website không hợp lệ"
    }),
    logoUrl: Joi.string().uri().optional().allow('').messages({
        "string.uri": "Logo URL không hợp lệ"
    }),
    description: Joi.string().optional().allow(''),
}); 