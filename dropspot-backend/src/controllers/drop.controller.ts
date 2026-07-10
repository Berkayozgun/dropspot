import { Request, Response } from 'express';
import * as dropService from '../services/drop.service';

export const createDrop = async (req: Request, res: Response) => {
  try {
    const drop = await dropService.createDrop(req.body);
    res.status(201).json(drop);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getDrops = async (req: Request, res: Response) => {
  try {
    const drops = await dropService.getDrops();
    res.status(200).json(drops);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDropById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const drop = await dropService.getDropById(id);
    if (!drop) {
      return res.status(404).json({ message: 'Drop bulunamadı.' });
    }
    res.status(200).json(drop);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminDrops = async (req: Request, res: Response) => {
  try {
    const drops = await dropService.getAdminDrops();
    res.status(200).json(drops);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminDropById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const drop = await dropService.getDropById(id);
    if (!drop) {
      return res.status(404).json({ message: 'Drop bulunamadı.' });
    }
    res.status(200).json(drop);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDrop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const drop = await dropService.updateDrop(id, req.body);
    res.status(200).json(drop);
  } catch (error: any) {
    console.error('Error updating drop:', error); // Hata logu eklendi
    res.status(400).json({ message: error.message });
  }
};

export const deleteDrop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await dropService.deleteDrop(id);
    res.status(204).send(); // No Content
  } catch (error: any) {
    console.error('Error deleting drop:', error); // Hata logu eklendi
    res.status(400).json({ message: error.message });
  }
};
