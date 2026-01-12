import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { LogService } from '../services/logService';

export class UserController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (role) where.role = role;

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
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

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      // ✅ normalize id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        res.status(404).json({ message: 'User tidak ditemukan' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { password, ...userData } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });

      await LogService.createLog(
        req.user!.id,
        'CREATE',
        'users',
        user.id,
        `User baru dibuat: ${user.username}`,
        req
      );

      const userResponse = user.toJSON();
      delete (userResponse as any).password;

      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: userResponse,
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ message: 'Username atau email sudah digunakan' });
        return;
      }
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const user = await User.findByPk(id);

      if (!user) {
        res.status(404).json({ message: 'User tidak ditemukan' });
        return;
      }

      const { password, ...updateData } = req.body;
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await user.update(updateData);

      await LogService.createLog(
        req.user!.id,
        'UPDATE',
        'users',
        user.id,
        `User diupdate: ${user.username}`,
        req
      );

      const userResponse = user.toJSON();
      delete (userResponse as any).password;

      res.json({
        success: true,
        message: 'User berhasil diupdate',
        data: userResponse,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const user = await User.findByPk(id);

      if (!user) {
        res.status(404).json({ message: 'User tidak ditemukan' });
        return;
      }

      await LogService.createLog(
        req.user!.id,
        'DELETE',
        'users',
        user.id,
        `User dihapus: ${user.username}`,
        req
      );

      await user.destroy();

      res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}