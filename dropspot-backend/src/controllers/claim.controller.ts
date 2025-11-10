import { Request, Response } from 'express';
import * as claimService from '../services/claim.service';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const claimDrop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: dropId } = req.params;
    const userId = req.userId as string;

    if (!userId) {
      return res.status(401).json({ message: 'Yetkilendirme token'ı bulunamadı.' });
    }

    const claimResult = await claimService.claimDrop(userId, dropId);
    res.status(200).json(claimResult);
  } catch (error: any) {
    if (error.message === 'Drop henüz claim penceresinde değil.' ||
        error.message === 'Kullanıcı bekleme listesinde değil.' ||
        error.message === 'Stok kalmamış.' ||
        error.message === 'Zaten hak talebinde bulundunuz.' ||
        error.message === 'Kullanıcı bulunamadı.' ||
        error.message === 'Drop bulunamadı.') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Sıra size gelmedi.') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
