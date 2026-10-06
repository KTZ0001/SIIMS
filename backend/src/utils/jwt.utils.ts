import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh';

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};
