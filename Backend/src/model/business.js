import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
    businessName: {type: String, required: true, trim: true},
    taxCode: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 6},
    phone: {type: String, required: true},
    address: {type: String, required: true},
    scale: {type: String, required: true},
    capital: {type: String, required: true},
    website: {type: String},
    logoUrl: {type: String},
    description: {type: String},
    status: {type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
    role: {type: String, enum: ['business', 'admin'], default: 'business', required: true}
}
, {timestamps: true, versionKey: false });

businessSchema.index({taxCode: 1, email: 1});
export default mongoose.model('Business', businessSchema); 