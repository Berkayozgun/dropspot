import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authorizeAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Yetkilendirme token'ı bulunamadı.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    if (user.role !== Role.ADMIN) {
      return res.status(403).json({ message: 'Bu işleme yetkiniz yok.' });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
