import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, trim: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: false, minlength: 6}, // Made optional for Google OAuth
    googleId: {type: String, unique: true, sparse: true}, // Google OAuth ID
    name: {type: String}, // Full name from Google
    avatar: {type: String}, // Profile picture from Google
    isEmailVerified: {type: Boolean, default: false},
    role: {type: String, enum: ['user', 'admin', 'banned'], default: 'user', required: true}
}
, {timestamps: true, versionKey: false });

userSchema.index({username: 1, email: 1});
export default mongoose.model('User', userSchema); 