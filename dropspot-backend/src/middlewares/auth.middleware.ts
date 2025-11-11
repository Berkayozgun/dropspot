import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'; // auth.service.ts ile aynı olmalı

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('Auth Middleware: İstek geldi.', req.method, req.url);
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.warn('Auth Middleware: Yetkilendirme başlığı eksik.');
    return res.status(401).json({ message: 'Yetkilendirme token bulunamadi.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn('Auth Middleware: Token eksik veya yanlış formatta.');
    return res.status(401).json({ message: 'Yetkilendirme token bulunamadi.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Auth Middleware: Token doğrulama hatası:', err.message);
      return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş token.' });
    }
    console.log('Auth Middleware: Token doğrulandı. userId:', (user as JwtPayload).userId);
    req.userId = (user as JwtPayload).userId;
    next();
  });
};
