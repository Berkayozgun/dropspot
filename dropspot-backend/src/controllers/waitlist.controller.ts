import { Request, Response } from 'express';
import * as waitlistService from '../services/waitlist.service';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const joinWaitlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: dropId } = req.params;
    const userId = req.userId as string;

    if (!userId) {
      return res.status(401).json({ message: 'Yetkilendirme token bulunamadi.' });
    }

    const waitlistEntry = await waitlistService.joinWaitlist(userId, dropId);
    res.status(201).json(waitlistEntry);
  } catch (error: any) {
    if (error.message === 'Kullanıcı zaten bekleme listesinde.') {
      return res.status(409).json({ message: error.message || 'Kullanici zaten bekleme listesinde.' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const leaveWaitlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: dropId } = req.params;
    const userId = req.userId as string;

    if (!userId) {
      return res.status(401).json({ message: 'Yetkilendirme token bulunamadi.' });
    }

    await waitlistService.leaveWaitlist(userId, dropId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Kullanıcı bekleme listesinde bulunamadı.') {
      return res.status(404).json({ message: error.message || 'Kullanici bekleme listesinde bulunamadi.' });
    }
    res.status(400).json({ message: error.message });
  }
};
