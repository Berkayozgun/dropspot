import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '../../generated/prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authorizeAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Yetkilendirme token bulunamadi.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      return res.status(404).json({ message: 'Kullanici bulunamadi.' });
    }

    if (user.role !== Role.ADMIN) {
      return res.status(403).json({ message: 'Bu isleme yetkiniz yok.' });
    }

    next();
  } catch (error: any) {
    console.error('Admin Middleware: Hata oluştu:', error);
    res.status(500).json({ message: error.message });
  }
};
