import Product from '../model/product.js';
import { productSchema } from '../schema/product.js';

// Tạo sản phẩm mới
export const createProduct = async (req, res) => {
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ errors: error.details.map(e => e.message) });
    }
    try {
        const product = await Product.create(req.body);
        return res.status(201).json({ message: 'Tạo sản phẩm thành công!', data: product });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};

// Lấy danh sách sản phẩm
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ data: products });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};

// Lấy sản phẩm theo id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ errors: ['Không tìm thấy sản phẩm!'] });
        }
        return res.status(200).json({ data: product });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ errors: error.details.map(e => e.message) });
    }
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ errors: ['Không tìm thấy sản phẩm!'] });
        }
        return res.status(200).json({ message: 'Cập nhật thành công!', data: product });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ errors: ['Không tìm thấy sản phẩm!'] });
        }
        return res.status(200).json({ message: 'Xóa thành công!' });
    } catch (err) {
        return res.status(500).json({ errors: [err.message] });
    }
}; 