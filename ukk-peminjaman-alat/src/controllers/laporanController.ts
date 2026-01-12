import { Request, Response } from 'express';
import Peminjaman from '../models/Peminjaman';
import User from '../models/User';
import Alat from '../models/Alat';
import { Op } from 'sequelize';
import { generatePDFLaporan } from '../utils/pdfGenerator';
import { generateExcelLaporan } from '../utils/excelGenerator';

export class LaporanController {
  static async downloadPDF(req: Request, res: Response): Promise<void> {
    try {
      const { start_date, end_date, status } = req.query;

      const where: any = {};

      // ✅ normalize start_date & end_date
      const startDateStr = Array.isArray(start_date) ? start_date[0] : start_date;
      const endDateStr = Array.isArray(end_date) ? end_date[0] : end_date;

      if (typeof startDateStr === 'string' && typeof endDateStr === 'string') {
        where.created_at = {
          [Op.between]: [new Date(startDateStr), new Date(endDateStr)],
        };
      }

      // ✅ normalize status
      const normalizedStatus = Array.isArray(status) ? status[0] : status;
      if (normalizedStatus) where.status = normalizedStatus;

      const peminjaman = await Peminjaman.findAll({
        where,
        include: [
          { model: User, as: 'peminjam', attributes: ['nama_lengkap'] },
          { model: Alat, as: 'alat', attributes: ['nama_alat', 'kode_alat'] },
        ],
        order: [['created_at', 'DESC']],
      });

      const pdfBuffer = await generatePDFLaporan(peminjaman);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=laporan-peminjaman-${Date.now()}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async downloadExcel(req: Request, res: Response): Promise<void> {
    try {
      const { start_date, end_date, status } = req.query;

      const where: any = {};

      const startDateStr = Array.isArray(start_date) ? start_date[0] : start_date;
      const endDateStr = Array.isArray(end_date) ? end_date[0] : end_date;

      if (typeof startDateStr === 'string' && typeof endDateStr === 'string') {
        where.created_at = {
          [Op.between]: [new Date(startDateStr), new Date(endDateStr)],
        };
      }
      
      const normalizedStatus = Array.isArray(status) ? status[0] : status;
      if (normalizedStatus) where.status = normalizedStatus;

      const peminjaman = await Peminjaman.findAll({
        where,
        include: [
          { model: User, as: 'peminjam', attributes: ['nama_lengkap'] },
          { model: Alat, as: 'alat', attributes: ['nama_alat', 'kode_alat'] },
        ],
        order: [['created_at', 'DESC']],
      });

      const excelBuffer = await generateExcelLaporan(peminjaman);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=laporan-peminjaman-${Date.now()}.xlsx`
      );
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}