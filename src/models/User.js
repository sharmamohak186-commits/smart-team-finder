const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: '' },
  experience: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  skills: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
