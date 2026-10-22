import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
  });
}

export function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === 'production';
  const common = {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  };
  res.cookie('access_token', accessToken, { ...common, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, {
    ...common,
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    let payload = null;
    if (token) {
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        payload = null;
      }
    }

    // If the short-lived access token is missing/expired, try the refresh cookie.
    if (!payload && req.cookies?.refresh_token) {
      try {
        const refreshPayload = jwt.verify(req.cookies.refresh_token, process.env.JWT_SECRET);
        if (refreshPayload.type !== 'refresh') throw new Error('bad token type');
        const user = await User.findById(refreshPayload.sub);
        if (!user) throw new Error('user gone');
        const newAccess = signAccessToken(user._id.toString());
        res.setHeader('X-New-Access-Token', newAccess);
        req.user = user;
        req.refreshedAccessToken = newAccess;
        return next();
      } catch {
        clearAuthCookies(res);
        return res.status(401).json({ message: 'Authentication required. Please sign in again.' });
      }
    }

    if (!payload) {
      return res.status(401).json({ message: 'Authentication required. Please sign in.' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Account not found. Please sign in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
