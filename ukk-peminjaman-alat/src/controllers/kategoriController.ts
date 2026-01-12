import { Request, Response } from 'express';
import Kategori from '../models/Kategori';
import { LogService } from '../services/logService';

export class KategoriController {
  static async getAll(_: Request, res: Response): Promise<void> {
    try {
      const kategori = await Kategori.findAll({
        order: [['nama_kategori', 'ASC']],
      });

      res.json({ success: true, data: kategori });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const kategori = await Kategori.findByPk(id);

      if (!kategori) {
        res.status(404).json({ message: 'Kategori tidak ditemukan' });
        return;
      }

      res.json({ success: true, data: kategori });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const kategori = await Kategori.create(req.body);

      const userId = Array.isArray(req.user?.id) ? req.user?.id[0] : req.user?.id;

      await LogService.createLog(
        userId,
        'CREATE',
        'kategori',
        kategori.id,
        `Kategori baru: ${kategori.nama_kategori}`,
        req
      );

      res.status(201).json({
        success: true,
        message: 'Kategori berhasil dibuat',
        data: kategori,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const kategori = await Kategori.findByPk(id);

      if (!kategori) {
        res.status(404).json({ message: 'Kategori tidak ditemukan' });
        return;
      }

      await kategori.update(req.body);

      const userId = Array.isArray(req.user?.id) ? req.user?.id[0] : req.user?.id;

      await LogService.createLog(
        userId,
        'UPDATE',
        'kategori',
        kategori.id,
        `Kategori diupdate: ${kategori.nama_kategori}`,
        req
      );

      res.json({
        success: true,
        message: 'Kategori berhasil diupdate',
        data: kategori,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const kategori = await Kategori.findByPk(id);

      if (!kategori) {
        res.status(404).json({ message: 'Kategori tidak ditemukan' });
        return;
      }

      const userId = Array.isArray(req.user?.id) ? req.user?.id[0] : req.user?.id;

      await LogService.createLog(
        userId,
        'DELETE',
        'kategori',
        kategori.id,
        `Kategori dihapus: ${kategori.nama_kategori}`,
        req
      );

      await kategori.destroy();

      res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}