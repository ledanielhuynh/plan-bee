const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tag: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[a-zA-Z0-9_]+$/, // Only alphanumeric and underscore
    minlength: 3,
    maxlength: 30
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  tagLastChanged: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  notificationPreferences: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalTasksCompleted: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    highestStreak: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if tag is available
userSchema.statics.isTagAvailable = async function(tag) {
  const existingUser = await this.findOne({ tag });
  return !existingUser;
};

// Check if user can change tag (3 months rule)
userSchema.methods.canChangeTag = function() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return this.tagLastChanged < threeMonthsAgo;
};

module.exports = mongoose.model('User', userSchema); 