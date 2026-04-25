const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Session must belong to a user.'],
    },
    refreshToken: {
      type: String,
      required: [true, 'Session must have a refresh token.'],
    },
    userAgent: String,
    ipAddress: String,
    isValid: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Session must have an expiry date.'],
    },
  },
  {
    timestamps: true,
  },
);

// Index for automatic deletion of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
