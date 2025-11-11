import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '../../generated/prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authorizeAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    console.log('Admin Middleware: userId yok, 401 dönülüyor.');
    return res.status(401).json({ message: 'Yetkilendirme token bulunamadi.' });
  }

  try {
    console.log('Admin Middleware: userId:', req.userId);
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      console.log('Admin Middleware: Kullanıcı bulunamadı, 404 dönülüyor.');
      return res.status(404).json({ message: 'Kullanici bulunamadi.' });
    }

    console.log('Admin Middleware: Kullanıcı rolü:', user.role);
    if (user.role !== Role.ADMIN) {
      console.log('Admin Middleware: Rol ADMIN değil, 403 dönülüyor.', user.role);
      return res.status(403).json({ message: 'Bu isleme yetkiniz yok.' });
    }

    console.log('Admin Middleware: Erişim onaylandı.');
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
