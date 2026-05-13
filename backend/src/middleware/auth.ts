import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    login: string;
    role: string;
  };
}

export const generateToken = (userId: number, login: string, role: string) => {
  return jwt.sign({ id: userId, login, role }, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
};