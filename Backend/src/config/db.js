import mongoose from 'mongoose';

export const connectionDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log('Kết nối MongoDB thành công!');
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error);
        console.log('Tiếp tục chạy server mà không cần database...');
        // Không exit process để server vẫn chạy được
    }
}; 