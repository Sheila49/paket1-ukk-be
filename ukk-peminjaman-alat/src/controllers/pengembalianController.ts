import { Request, Response } from 'express';
import Pengembalian from '../models/Pengembalian';
import Peminjaman from '../models/Peminjaman';
import Alat from '../models/Alat';
import User from '../models/User';
import { LogService } from '../services/logService';
import { DendaService } from '../services/dendaService';
import sequelize from '../config/database';

export class PengembalianController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows } = await Pengembalian.findAndCountAll({
        include: [
          {
            model: Peminjaman,
            as: 'peminjaman',
            include: [
              { model: User, as: 'peminjam', attributes: ['id', 'username', 'nama_lengkap'] },
              { model: Alat, as: 'alat' },
            ],
          },
          { model: User, as: 'penerima', attributes: ['id', 'username', 'nama_lengkap'] },
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
      // ✅ normalize id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const pengembalian = await Pengembalian.findByPk(id, {
        include: [
          {
            model: Peminjaman,
            as: 'peminjaman',
            include: [
              { model: User, as: 'peminjam', attributes: ['id', 'username', 'nama_lengkap'] },
              { model: Alat, as: 'alat' },
            ],
          },
          { model: User, as: 'penerima', attributes: ['id', 'username', 'nama_lengkap'] },
        ],
      });

      if (!pengembalian) {
        res.status(404).json({ message: 'Pengembalian tidak ditemukan' });
        return;
      }

      res.json({ success: true, data: pengembalian });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const t = await sequelize.transaction();
    
    try {
      const { peminjaman_id, kondisi_alat, jumlah_dikembalikan, catatan } = req.body;

      const peminjaman = await Peminjaman.findByPk(peminjaman_id, {
        include: [{ model: Alat, as: 'alat' }],
      });

      if (!peminjaman) {
        await t.rollback();
        res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        return;
      }

      if (peminjaman.status !== 'disetujui') {
        await t.rollback();
        res.status(400).json({ message: 'Peminjaman belum disetujui' });
        return;
      }

      if (jumlah_dikembalikan > peminjaman.jumlah_pinjam) {
        await t.rollback();
        res.status(400).json({ message: 'Jumlah dikembalikan melebihi jumlah pinjam' });
        return;
      }

      const { keterlambatan, denda } = DendaService.hitungDenda(
        peminjaman.tanggal_kembali_rencana,
        new Date()
      );

      const pengembalian = await Pengembalian.create({
        peminjaman_id,
        kondisi_alat,
        jumlah_dikembalikan,
        keterlambatan_hari: keterlambatan,
        denda,
        catatan,
        diterima_oleh: req.user!.id,
      }, { transaction: t });

      const alat = peminjaman.alat;
      await alat.update({
        jumlah_tersedia: alat.jumlah_tersedia + jumlah_dikembalikan,
      }, { transaction: t });

      await peminjaman.update({
        status: 'dikembalikan',
      }, { transaction: t });

      await LogService.createLog(
        req.user!.id,
        'CREATE',
        'pengembalian',
        pengembalian.id,
        `Pengembalian alat: ${alat.nama_alat} (${jumlah_dikembalikan} unit)${keterlambatan > 0 ? `, Denda: Rp ${denda}` : ''}`,
        req
      );

      await t.commit();

      res.status(201).json({
        success: true,
        message: 'Pengembalian berhasil diproses',
        data: pengembalian,
      });
    } catch (error: any) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  }
}