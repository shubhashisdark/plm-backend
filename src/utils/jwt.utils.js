// utils/jwt.utils.js
import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';

export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};