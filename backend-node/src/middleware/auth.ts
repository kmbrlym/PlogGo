import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Declare global for Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}; 