import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Xe', 'Tượng', 'Mã', 'Vua', 'Hậu'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rarity: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Schema cho túi mù (mystery bag)
const mysteryBagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
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
    image: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const MysteryBag = mongoose.model('MysteryBag', mysteryBagSchema);

export default Product;
export { MysteryBag }; 