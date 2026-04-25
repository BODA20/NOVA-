const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../user/user.model');
const Session = require('./session.model');
const AppError = require('../../utils/appError');

/**
 * Service to handle authentication business logic
 * Standalone and decoupled from Express
 */

const signToken = (id, secret, expiresIn) => {
  return jwt.sign({ id }, secret, {
    expiresIn,
  });
};

exports.createAuthTokens = async (userId, userAgent, ipAddress) => {
  const accessToken = signToken(
    userId,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN,
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  
  // Calculate expiry date (simple parse for days)
  const days = parseInt(refreshTokenExpiresIn);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  // Save session
  await Session.create({
    user: userId,
    refreshToken,
    userAgent,
    ipAddress,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

exports.refreshAccessToken = async (refreshToken, userAgent, ipAddress) => {
  const session = await Session.findOne({ refreshToken, isValid: true });

  if (!session || session.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const accessToken = signToken(
    session.user,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN,
  );

  // Optional: Rotate refresh token for maximum security
  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  session.refreshToken = newRefreshToken;
  await session.save();

  return { accessToken, refreshToken: newRefreshToken };
};

exports.revokeSession = async (refreshToken) => {
  await Session.findOneAndUpdate({ refreshToken }, { isValid: false });
};

exports.revokeAllUserSessions = async (userId) => {
  await Session.updateMany({ user: userId }, { isValid: false });
};
