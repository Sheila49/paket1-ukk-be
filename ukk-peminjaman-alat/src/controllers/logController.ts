import { Request, Response } from 'express';
import Log from '../models/Log';
import User from '../models/User';

export class LogController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50, aksi, tabel } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (aksi) where.aksi = aksi;
      if (tabel) where.tabel = tabel;

      const { count, rows } = await Log.findAndCountAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'nama_lengkap'] }],
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
