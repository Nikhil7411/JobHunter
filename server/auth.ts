import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@shared/schema';

// Use environment variable for JWT secret, with a fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_for_dev';
const SALT_ROUNDS = 10;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password with hash
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    type: user.type,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

// Middleware to authenticate requests
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to check if user is a company
export function isCompany(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.type === 'company') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Company access required.' });
  }
}

// Middleware to check if user is a candidate
export function isCandidate(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.type === 'candidate') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Candidate access required.' });
  }
}

// Augment Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
