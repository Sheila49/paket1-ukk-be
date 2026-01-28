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
      const userId = req.user!.id // ambil dari token, bukan dari URL
      const { page = 1, limit = 10, status } = req.query
      const offset = (Number(page) - 1) * Number(limit)

      const where: any = { user_id: userId }
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
      console.error("getByUser error:", error)
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
        res.status(400).json({ message: `Stok tidak cukup. Tersedia: ${alat.jumlah_tersedia}` });
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

      const updated = await Peminjaman.findByPk(peminjaman.id, {
        include: [
          { model: User, as: 'peminjam', attributes: ['id', 'username', 'nama_lengkap'] },
          { model: Alat, as: 'alat' },
          { model: User, as: 'penyetuju', attributes: ['id', 'username', 'nama_lengkap'] },
        ],
      });

      res.json({ success: true, message: 'Peminjaman berhasil diajukan', data: updated });
    } catch (error: any) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  }

  static async approve(req: Request, res: Response): Promise<void> {
  const t = await sequelize.transaction()
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const peminjaman = await Peminjaman.findByPk(id, { include: [{ model: Alat, as: 'alat' }] })

    if (!req.user) {
      await t.rollback()
       res.status(401).json({ message: "User tidak terautentikasi" })
       return
    }
    if (!peminjaman) {
      await t.rollback()
       res.status(404).json({ message: "Peminjaman tidak ditemukan" })
       return
    }
    if (!peminjaman.alat) {
      await t.rollback()
       res.status(400).json({ message: "Data alat tidak ditemukan dalam relasi" })
       return
    }
    if (peminjaman.status !== "diajukan") {
      await t.rollback()
       res.status(400).json({ message: "Peminjaman sudah diproses" })
       return
    }

    const alat = peminjaman.alat
    if (alat.jumlah_tersedia < peminjaman.jumlah_pinjam) {
      await t.rollback()
       res.status(400).json({ message: `Stok tidak cukup. Tersedia: ${alat.jumlah_tersedia}` })
    }

    await alat.update({ jumlah_tersedia: alat.jumlah_tersedia - peminjaman.jumlah_pinjam }, { transaction: t })

    // ✅ gunakan fallback untuk catatan
    const catatan = req.body?.catatan_persetujuan || null

    await peminjaman.update({
      status: "disetujui",
      disetujui_oleh: req.user.id,
      tanggal_persetujuan: new Date(),
      tanggal_pinjam: new Date(),
      catatan_persetujuan: catatan,
    }, { transaction: t })

    await t.commit()
    res.json({ success: true, message: "Peminjaman berhasil disetujui", data: peminjaman })
  } catch (error: any) {
    await t.rollback()
    console.error("Approve error detail:", error)
    res.status(500).json({ message: error.message })
  }
}

  static async reject(req: Request, res: Response): Promise<void> {
  const t = await sequelize.transaction(); // Tambahkan transaction
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const peminjaman = await Peminjaman.findByPk(id);

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

    // ✅ FIX: Handle catatan_persetujuan dengan fallback
    const catatan = req.body?.catatan_persetujuan || null;

    await peminjaman.update({
      status: 'ditolak',
      disetujui_oleh: req.user!.id,
      tanggal_persetujuan: new Date(),
      catatan_persetujuan: catatan, // Gunakan variable dengan fallback
    }, { transaction: t });

    await LogService.createLog(
      req.user!.id,
      'REJECT',
      'peminjaman',
      peminjaman.id,
      `Peminjaman ditolak oleh ${req.user!.username}`,
      req
    );

    await t.commit();

    res.json({
      success: true,
      message: 'Peminjaman ditolak',
      data: peminjaman,
    });
  } catch (error: any) {
    await t.rollback();
    console.error('Reject error:', error);
    res.status(500).json({ message: error.message });
  }
}

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const peminjaman = await Peminjaman.findByPk(id);

      if (!peminjaman) {
        res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        return;
      }

      await peminjaman.update(req.body);

      await LogService.createLog(
        req.user!.id,
        'UPDATE',
        'peminjaman',
        peminjaman.id,
        `Peminjaman diupdate oleh ${req.user!.username}`,
        req
      );

      res.json({
        success: true,
        message: 'Peminjaman berhasil diupdate',
        data: peminjaman,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const peminjaman = await Peminjaman.findByPk(id);

      if (!peminjaman) {
        res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        return;
      }

      await peminjaman.destroy();

      await LogService.createLog(
        req.user!.id,
        'DELETE',
        'peminjaman',
        Number(id),
        `Peminjaman dihapus oleh ${req.user!.username}`,
        req
      );

      res.json({
        success: true,
        message: 'Peminjaman berhasil dihapus',
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
    static async setDipinjam(req: Request, res: Response): Promise<void> {
    const t = await sequelize.transaction();
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const peminjaman = await Peminjaman.findByPk(id, { include: [{ model: Alat, as: 'alat' }], transaction: t });
      if (!peminjaman) {
        await t.rollback();
        res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });
        return;
      }

      // hanya boleh diubah ke "dipinjam" kalau status saat ini "disetujui"
      if (peminjaman.status !== 'disetujui') {
        await t.rollback();
        res.status(400).json({ message: `Status saat ini ${peminjaman.status}, hanya "disetujui" yang bisa diubah ke "dipinjam"` });
        return;
      }

      // update status peminjaman
      await peminjaman.update({ status: 'dipinjam', tanggal_pinjam: new Date() }, { transaction: t });

      // update status alat juga
      await peminjaman.alat.update({ status: 'dipinjam' }, { transaction: t });

      // log aktivitas
      await LogService.createLog(
        req.user!.id,
        'UPDATE',
        'peminjaman',
        peminjaman.id,
        `Status peminjaman ${peminjaman.kode_peminjaman} diubah ke "dipinjam"`,
        req
      );

      await t.commit();
      res.json({ success: true, message: 'Peminjaman berhasil diubah ke status dipinjam', data: peminjaman });
    } catch (error: any) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  }
}