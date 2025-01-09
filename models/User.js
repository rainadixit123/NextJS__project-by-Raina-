import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },
  
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);

