// Script để kiểm tra và cập nhật trạng thái banners
import mongoose from 'mongoose';
import Banner from './src/model/banner.js';
import dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/exe_project';

async function checkAndUpdateBanners() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to MongoDB');

        // Lấy tất cả banners
        const allBanners = await Banner.find();
        console.log(`📊 Total banners: ${allBanners.length}`);
        
        console.log('\n📋 All banners:');
        allBanners.forEach(banner => {
            console.log(`- ${banner.name}: isActive=${banner.isActive}, coverImage=${banner.coverImage}`);
        });

        // Cập nhật tất cả banners thành active
        const result = await Banner.updateMany(
            {},
            { $set: { isActive: true } }
        );
        
        console.log(`\n✅ Updated ${result.modifiedCount} banners to active status`);

        // Kiểm tra lại
        const activeBanners = await Banner.find({ isActive: true });
        console.log(`\n📊 Active banners after update: ${activeBanners.length}`);
        
        console.log('\n📋 Active banners:');
        activeBanners.forEach(banner => {
            console.log(`- ${banner.name}: isActive=${banner.isActive}, coverImage=${banner.coverImage}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

checkAndUpdateBanners();
