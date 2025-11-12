const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    // Required only for local auth
    required: function() {
      return this.provider === 'local';
    }
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=random&name='
  },
  provider: {
    type: String,
    enum: ['google', 'github', 'local'],
    required: true
  },
  providerId: {
    type: String,
    // Not required for local auth
    required: false
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ providerId: 1, provider: 1 });

module.exports = mongoose.model('User', userSchema);
