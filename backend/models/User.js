import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'driver'], default: 'driver' },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    mustChangePassword: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Password check
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
