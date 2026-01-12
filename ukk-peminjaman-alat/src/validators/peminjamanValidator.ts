import Joi from 'joi';

export const createPeminjamanSchema = Joi.object({
  alat_id: Joi.number().integer().required(),
  jumlah_pinjam: Joi.number().integer().min(1).required(),
  tanggal_kembali_rencana: Joi.date().iso().required(),
  keperluan: Joi.string().optional(),
});

export const approvePeminjamanSchema = Joi.object({
  catatan_persetujuan: Joi.string().optional(),
});

export const createPengembalianSchema = Joi.object({
  peminjaman_id: Joi.number().integer().required(),
  kondisi_alat: Joi.string().valid('baik', 'rusak ringan', 'rusak berat').required(),
  jumlah_dikembalikan: Joi.number().integer().min(1).required(),
  catatan: Joi.string().optional(),
});
