import Joi from 'joi';

export const registerSchema = Joi.object({
    username: Joi.string().required().trim().messages({
        "any.required": "ko để trống",
        "string.empty": "ko để rỗng",
    }),
    email: Joi.string().email().required().messages({
        "string.email" : "ko hop le",
        "any.required": "bắt buộc",
        "string.empty": "ko để trống",
    }),
    password: Joi.string().min(6).required().messages({
        "any.required":"bắt buộc",
        "string.min": "password cần 6 kí tự",
        "string.empty": " ko để trống",
    }),
    confirmpassword: Joi.string().required().valid(Joi.ref('password'))
        .error(errors => {
            errors.forEach(err => {
                if (err.code === "any.only") {
                    err.message = "ko trùng";
                }
                if (err.code === "any.required") {
                    err.message = "bắt buộc";
                }
                if (err.code === "string.empty") {
                    err.message = "ko để trống";
                }
            });
            return errors;
        }),
    role: Joi.string().valid('user', 'admin').optional(),
}); 