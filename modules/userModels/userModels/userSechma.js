const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    photo: String,

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },

    // email verify
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,
    emailVerifyExpires: Date,

    // reset password
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // soft delete
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    pendingEmailToken: String,
    pendingEmailExpires: Date,
  },
  { timestamps: true },
);

userSchema.methods.createEmailVerifyToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.emailVerifyToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000;

  return rawToken;
};

userSchema.methods.createPendingEmailToken = function (newEmail) {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.pendingEmailToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.pendingEmailExpires = Date.now() + 24 * 60 * 60 * 1000;
  return rawToken;
};
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10,
  );
  return JWTTimestamp < changedTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.resetDataSchema = function (data) {
  const allowedFields = ['name', 'email', 'photo'];
  Object.keys(data).forEach((key) => {
    if (allowedFields.includes(key)) {
      this[key] = data[key];
    }
  });
};

userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

module.exports = mongoose.model('User', userSchema);
