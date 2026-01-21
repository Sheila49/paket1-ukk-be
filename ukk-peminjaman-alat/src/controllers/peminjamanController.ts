import { Request, Response } from 'express';
import Peminjaman from '../models/Peminjaman';
import Alat from '../models/Alat';
import User from '../models/User';
import { LogService } from '../services/logService';
import sequelize from '../config/database';

export class PeminjamanController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {};
      
      if (req.user!.role === 'peminjam') {
        where.user_id = req.user!.id;
      }
      
      if (status) where.status = status;

      const { count, rows } = await Peminjaman.findAndCountAll({
        where,
        include: [
          { model: User, as: 'peminjam', attributes: ['id', 'username', 'nama_lengkap'] },
          { model: Alat, as: 'alat' },
          { model: User, as: 'penyetuju', attributes: ['id', 'username', 'nama_lengkap'] },
        ],
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
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const peminjaman = await Peminjaman.findByPk(id, {
        include: [
          { model: User, as: 'peminjam', attributes: ['id', 'username', 'nama_lengkap'] },
          { model: Alat, as: 'alat' },
          { model: User, as: 'penyetuju', attributes: ['id', 'username', 'nama_lengkap'] },
        ],
      });

      if (!peminjaman) {
        res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        return;
      }

      if (req.user!.role === 'peminjam' && peminjaman.user_id !== req.user!.id) {
        res.status(403).json({ message: 'Akses ditolak' });
        return;
      }

      res.json({ success: true, data: peminjaman });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getByUser(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { page = 1, limit = 10, status } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const where: any = { user_id: Number(id) }
    if (status) where.status = status

    const { count, rows } = await Peminjaman.findAndCountAll({
      where,
      include: [
        { model: User, as: 'peminjam', attributes: ['id', 'username', 'nama_lengkap'] },
        { model: Alat, as: 'alat' },
        { model: User, as: 'penyetuju', attributes: ['id', 'username', 'nama_lengkap'] },
      ],
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    })

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

  static async create(req: Request, res: Response): Promise<void> {
    const t = await sequelize.transaction();
    
    try {
      const { alat_id, jumlah_pinjam, tanggal_kembali_rencana, keperluan } = req.body;

      const alat = await Alat.findByPk(alat_id);
      
      if (!alat) {
        await t.rollback();
        res.status(404).json({ message: 'Alat tidak ditemukan' });
        return;
      }

      if (alat.jumlah_tersedia < jumlah_pinjam) {
        await t.rollback();
        res.status(400).json({ 
          message: `Stok tidak cukup. Tersedia: ${alat.jumlah_tersedia}` 
        });
        return;
      }

      const kodePeminjaman = `PJM-${Date.now()}-${req.user!.id}`;

      const peminjaman = await Peminjaman.create({
        kode_peminjaman: kodePeminjaman,
        user_id: req.user!.id,
        alat_id,
        jumlah_pinjam,
        tanggal_kembali_rencana,
        keperluan,
        status: 'diajukan',
      }, { transaction: t });

      await LogService.createLog(
        req.user!.id,
        'CREATE',
        'peminjaman',
        peminjaman.id,
        `Peminjaman diajukan: ${alat.nama_alat} (${jumlah_pinjam} unit)`,
        req
      );

      await t.commit();

      res.status(201).json({
        success: true,
        message: 'Peminjaman berhasil diajukan',
        data: peminjaman,
      });
    } catch (error: any) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  }

  static async approve(req: Request, res: Response): Promise<void> {
    const t = await sequelize.transaction();
    
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const peminjaman = await Peminjaman.findByPk(id, {
        include: [{ model: Alat, as: 'alat' }],
      });

      if (!peminjaman) {
        await t.rollback();
        res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        return;
      }

      if (peminjaman.status !== 'diajukan') {
        await t.rollback();
        res.status(400).json({ message: 'Peminjaman sudah diproses' });
        return;
      }

      const alat = peminjaman.alat;
      
      if (alat.jumlah_tersedia < peminjaman.jumlah_pinjam) {
        await t.rollback();
        res.status(400).json({ 
          message: `Stok tidak cukup. Tersedia: ${alat.jumlah_tersedia}` 
        });
        return;
      }

      await alat.update({
        jumlah_tersedia: alat.jumlah_tersedia - peminjaman.jumlah_pinjam,
      }, { transaction: t });

      await peminjaman.update({
        status: 'disetujui',
        disetujui_oleh: req.user!.id,
        tanggal_persetujuan: new Date(),
        tanggal_pinjam: new Date(),
        catatan_persetujuan: req.body.catatan_persetujuan,
      }, { transaction: t });

      await LogService.createLog(
        req.user!.id,
        'APPROVE',
        'peminjaman',
        peminjaman.id,
        `Peminjaman disetujui oleh ${req.user!.username}`,
        req
      );

      await t.commit();

      res.json({
        success: true,
        message: 'Peminjaman berhasil disetujui',
        data: peminjaman,
      });
    } catch (error: any) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  }

  static async reject(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const peminjaman = await Peminjaman.findByPk(id);

      if (!peminjaman) {
        res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        return;
      }

      if (peminjaman.status !== 'diajukan') {
        res.status(400).json({ message: 'Peminjaman sudah diproses' });
        return;
      }

      await peminjaman.update({
        status: 'ditolak',
        disetujui_oleh: req.user!.id,
        tanggal_persetujuan: new Date(),
        catatan_persetujuan: req.body.catatan_persetujuan,
      });

      await LogService.createLog(
        req.user!.id,
        'REJECT',
        'peminjaman',
        peminjaman.id,
        `Peminjaman ditolak oleh ${req.user!.username}`,
        req
      );

      res.json({
        success: true,
        message: 'Peminjaman ditolak',
        data: peminjaman,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}