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
              { model: User, as: 'peminjam', attributes: ['id', 'username', 'nama_lengkap', 'email'] },
              { model: Alat, as: 'alat', attributes: ['id', 'kode_alat', 'nama_alat', 'jumlah_total', 'jumlah_tersedia'] },
            ],
          },
          { model: User, as: 'penerima', attributes: ['id', 'username', 'nama_lengkap'] },
        ],
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']],
      });

      if (count === 0) {
        console.log("Belum ada data pengembalian di database");
        res.json({
          success: true,
          message: "Belum ada data pengembalian",
          data: [],
          pagination: {
            total: 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: 0,
          },
        });
        return;
      }

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
      console.error('Error getAll pengembalian:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const pengembalian = await Pengembalian.findByPk(id, {
        include: [
          {
            model: Peminjaman,
            as: 'peminjaman',
            include: [
              { model: User, as: 'peminjam', attributes: ['id', 'username', 'nama_lengkap', 'email'] },
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
      console.error('Error getById pengembalian:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const t = await sequelize.transaction();
    
    try {
      const { peminjaman_id, kondisi_alat, catatan } = req.body;

      // ✅ LOGGING untuk debugging
      console.log('📝 Request Body:', { peminjaman_id, kondisi_alat, catatan });
      console.log('👤 User:', req.user);

      // ✅ Validasi user authentication
      if (!req.user || !req.user.id) {
        await t.rollback();
        res.status(401).json({ 
          message: 'Unauthorized: User tidak terautentikasi' 
        });
        return;
      }

      // ✅ Validasi input
      if (!peminjaman_id || !kondisi_alat) {
        await t.rollback();
        res.status(400).json({ 
          message: 'Data tidak lengkap',
          errors: [
            { field: 'peminjaman_id', message: 'Peminjaman ID wajib diisi' },
            { field: 'kondisi_alat', message: 'Kondisi alat wajib diisi' }
          ]
        });
        return;
      }

      // ✅ Cek peminjaman
      const peminjaman = await Peminjaman.findByPk(peminjaman_id, {
        include: [{ model: Alat, as: 'alat' }],
        transaction: t
      });

      if (!peminjaman) {
        await t.rollback();
        res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });
        return;
      }

      console.log('📦 Peminjaman found:', {
        id: peminjaman.id,
        status: peminjaman.status,
        jumlah_pinjam: peminjaman.jumlah_pinjam
      });

      // ✅ Validasi status peminjaman - HANYA "dipinjam" yang bisa dikembalikan
      if (!['dipinjam', 'disetujui'].includes(peminjaman.status)) {
        await t.rollback()
        res.status(400).json({
          message: `Status tidak valid untuk pengembalian`,
          current_status: peminjaman.status,
          hint: 'Hanya peminjaman yang sudah disetujui atau dipinjam yang bisa diuji coba dikembalikan'
        })
        return
      }


      // ✅ Cek apakah sudah pernah dikembalikan
      const existingReturn = await Pengembalian.findOne({
        where: { peminjaman_id },
        transaction: t
      });

      if (existingReturn) {
        await t.rollback();
        res.status(409).json({ 
          message: 'Alat ini sudah pernah dikembalikan sebelumnya',
          existing_return: existingReturn
        });
        return;
      }

      // ✅ Validasi alat exists
      if (!peminjaman.alat) {
        await t.rollback();
        res.status(404).json({ 
          message: 'Data alat tidak ditemukan pada peminjaman ini',
          hint: 'Pastikan relasi peminjaman->alat sudah terkonfigurasi dengan benar'
        });
        return;
      }

      const alat = peminjaman.alat;
      console.log('🔧 Alat found:', {
        id: alat.id,
        nama: alat.nama_alat,
        jumlah_tersedia: alat.jumlah_tersedia
      });

      // ✅ Jumlah dikembalikan OTOMATIS = jumlah pinjam (TIDAK BISA KURANG)
      const jumlahDikembalikan = peminjaman.jumlah_pinjam;

      // ✅ Hitung denda
      const { keterlambatan, denda } = DendaService.hitungDenda(
        peminjaman.tanggal_kembali_rencana,
        new Date()
      );

      console.log(`💰 Perhitungan denda: Keterlambatan ${keterlambatan} hari, Denda Rp ${denda}`);

      // ✅ Validasi kondisi alat
      const kondisiValid = ['baik', 'rusak ringan', 'rusak berat'];
      if (!kondisiValid.includes(kondisi_alat.toLowerCase().trim())) {
   res.status(400).json({ message: "Kondisi alat tidak valid" })
}

      const kondisiNormalized = kondisi_alat.toLowerCase().trim();
      
      if (!kondisiValid.includes(kondisiNormalized)) {
        await t.rollback();
        res.status(400).json({ 
          message: `Kondisi alat tidak valid. Pilihan: ${kondisiValid.join(', ')}`,
          provided: kondisi_alat
        });
        return;
      }

      // ✅ Buat data pengembalian dengan SEMUA field yang required
      const pengembalianData = {
        peminjaman_id: Number(peminjaman_id),
        tanggal_kembali_aktual: new Date(),
        kondisi_alat: kondisiNormalized,
        jumlah_dikembalikan: jumlahDikembalikan, // ✅ WAJIB - field ini REQUIRED di database!
        keterlambatan_hari: Number(keterlambatan),
        denda: parseFloat(denda.toFixed(2)),
        catatan: catatan || null,
        diterima_oleh: Number(req.user.id),
      };

      console.log('🔨 Creating Pengembalian with data:', pengembalianData);

      // ✅ Buat record pengembalian
      const pengembalian = await Pengembalian.create(pengembalianData, { transaction: t });

      console.log('✅ Pengembalian created with ID:', pengembalian.id);

      // ✅ Update stok alat
      const newJumlahTersedia = alat.jumlah_tersedia + jumlahDikembalikan;
      
      console.log('📊 Updating alat stok...');
      console.log('📊 Alat current values:', {
        id: alat.id,
        kode_alat: alat.kode_alat,
        nama_alat: alat.nama_alat,
        jumlah_tersedia: alat.jumlah_tersedia,
        jumlah_total: alat.jumlah_total
      });
      console.log('📊 New jumlah_tersedia:', newJumlahTersedia);
      
      try {
        await alat.update({
          jumlah_tersedia: newJumlahTersedia
        }, { transaction: t });
        
        console.log(`✅ Stok alat ${alat.nama_alat} berhasil diupdate: ${alat.jumlah_tersedia} → ${newJumlahTersedia}`);
      } catch (updateError: any) {
        console.error('❌ Error saat update alat:', updateError);
        console.error('❌ Update error name:', updateError.name);
        console.error('❌ Update error message:', updateError.message);
        throw updateError;
      }

      // ✅ Update status peminjaman → "dikembalikan"
      console.log('📝 Updating peminjaman status to "dikembalikan"...');
      
      try {
        await peminjaman.update({
          status: 'dikembalikan',
        }, { transaction: t });
        
        console.log('✅ Status peminjaman updated to: dikembalikan');
      } catch (updateError: any) {
        console.error('❌ Error saat update peminjaman:', updateError);
        console.error('❌ Update error name:', updateError.name);
        console.error('❌ Update error message:', updateError.message);
        throw updateError;
      }

      // ✅ Log aktivitas
      const logMessage = [
        `Pengembalian alat: ${alat.nama_alat}`,
        `Jumlah: ${jumlahDikembalikan} unit (LENGKAP)`,
        `Kondisi: ${kondisiNormalized}`,
        keterlambatan > 0 ? `Terlambat: ${keterlambatan} hari` : 'Tepat waktu',
        denda > 0 ? `Denda: Rp ${denda.toLocaleString('id-ID')}` : 'Tidak ada denda',
      ].join(' | ');

      console.log('📝 Creating log...');
      
      try {
        await LogService.createLog(
          req.user.id,
          'CREATE',
          'pengembalian',
          pengembalian.id,
          logMessage,
          req
        );
        console.log('✅ Log created successfully');
      } catch (logError: any) {
        console.error('❌ Error saat create log:', logError);
        console.error('❌ Log error name:', logError.name);
        console.error('❌ Log error message:', logError.message);
        // Don't throw - log is not critical, continue with transaction
      }

      await t.commit();
      console.log('✅ Transaction committed successfully');

      // ✅ Response sukses dengan detail lengkap
      res.status(201).json({
        success: true,
        message: 'Pengembalian berhasil diproses. Alat telah dikembalikan lengkap.',
        data: {
          ...pengembalian.toJSON(),
          peminjaman: {
            id: peminjaman.id,
            kode_peminjaman: peminjaman.kode_peminjaman,
            jumlah_pinjam: peminjaman.jumlah_pinjam,
            alat: {
              nama_alat: alat.nama_alat,
              kode_alat: alat.kode_alat,
              jumlah_tersedia_sebelum: alat.jumlah_tersedia,
              jumlah_tersedia_sesudah: newJumlahTersedia,
            }
          }
        },
        info: {
          keterlambatan: {
            hari: keterlambatan,
            denda: denda,
            formatted_denda: `Rp ${denda.toLocaleString('id-ID')}`
          },
          kondisi_alat: kondisiNormalized,
          catatan_denda: denda > 0 ? 'Harap segera melakukan pembayaran denda' : null,
          pengembalian_lengkap: true
        }
      });

    } catch (error: any) {
      await t.rollback();
      
      // ✅ LOGGING ERROR DETAIL
      console.error('❌ ============ ERROR CREATE PENGEMBALIAN ============');
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // ✅ Sequelize-specific errors
      if (error.name === 'SequelizeValidationError') {
        console.error('❌ Validation errors:', error.errors);
        res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors.map((e: any) => ({
            field: e.path,
            message: e.message,
            value: e.value,
            type: e.type
          }))
        });
        return;
      }

      if (error.name === 'SequelizeForeignKeyConstraintError') {
        console.error('❌ Foreign key error:', error.parent);
        res.status(400).json({ 
          message: 'Foreign key constraint error',
          error: error.message,
          hint: 'Pastikan peminjaman_id atau diterima_oleh valid'
        });
        return;
      }

      if (error.name === 'SequelizeDatabaseError') {
        console.error('❌ Database error:', error.parent);
        res.status(500).json({ 
          message: 'Database error',
          error: error.message,
          sql: error.sql,
          hint: 'Periksa struktur database dan constraint'
        });
        return;
      }

      // ✅ Generic error response
      res.status(500).json({ 
        message: 'Terjadi kesalahan saat memproses pengembalian',
        error: error.message,
        errorName: error.name,
        // ⚠️ Hanya untuk development, hapus di production
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // ✅ Endpoint: Konfirmasi pembayaran denda
  static async konfirmasiPembayaranDenda(req: Request, res: Response): Promise<void> {
    const t = await sequelize.transaction();
    
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { metode_pembayaran, bukti_pembayaran } = req.body;

      console.log('💳 Konfirmasi pembayaran denda untuk ID:', id);

      // ✅ Validasi user authentication
      if (!req.user || !req.user.id) {
        await t.rollback();
        res.status(401).json({ 
          message: 'Unauthorized: User tidak terautentikasi' 
        });
        return;
      }

      const pengembalian = await Pengembalian.findByPk(id, { transaction: t });

      if (!pengembalian) {
        await t.rollback();
        res.status(404).json({ message: 'Pengembalian tidak ditemukan' });
        return;
      }

      // ✅ Check denda dengan null-safe operator
      const dendaValue = pengembalian.denda ?? 0;
      
      if (dendaValue === 0) {
        await t.rollback();
        res.status(400).json({ message: 'Tidak ada denda yang perlu dibayar' });
        return;
      }

      // Update catatan pembayaran
      const catatanBaru = [
        pengembalian.catatan,
        `Denda dibayar: Rp ${dendaValue.toLocaleString('id-ID')}`,
        `Metode: ${metode_pembayaran}`,
        `Tanggal: ${new Date().toLocaleString('id-ID')}`,
        bukti_pembayaran ? `Bukti: ${bukti_pembayaran}` : null
      ].filter(Boolean).join(' | ');

      await pengembalian.update({
        catatan: catatanBaru
      }, { transaction: t });

      await LogService.createLog(
        req.user.id,
        'UPDATE',
        'pengembalian',
        pengembalian.id,
        `Pembayaran denda Rp ${dendaValue.toLocaleString('id-ID')} - ${metode_pembayaran}`,
        req
      );

      await t.commit();

      console.log('✅ Pembayaran denda berhasil dikonfirmasi');

      res.json({
        success: true,
        message: 'Pembayaran denda berhasil dikonfirmasi',
        data: pengembalian
      });

    } catch (error: any) {
      await t.rollback();
      console.error('❌ Error konfirmasi pembayaran:', error);
      res.status(500).json({ 
        message: 'Terjadi kesalahan saat konfirmasi pembayaran',
        error: error.message 
      });
    }
  }
}