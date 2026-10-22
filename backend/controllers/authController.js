import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '../middleware/auth.js';

const PASSWORD_MIN = 6;

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < PASSWORD_MIN) {
      return res.status(400).json({ message: `Password must be at least ${PASSWORD_MIN} characters.` });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'A user with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({ user: user.toSafeJSON(), accessToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    setAuthCookies(res, accessToken, refreshToken);

    res.json({ user: user.toSafeJSON(), accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  clearAuthCookies(res);
  res.json({ message: 'Logged out successfully.' });
}

export async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}
