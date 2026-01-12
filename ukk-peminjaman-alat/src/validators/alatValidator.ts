import Joi from 'joi';

export const createAlatSchema = Joi.object({
  kode_alat: Joi.string().max(50).required(),
  nama_alat: Joi.string().max(100).required(),
  kategori_id: Joi.number().integer().optional(),
  deskripsi: Joi.string().optional(),
  kondisi: Joi.string().valid('baik', 'rusak ringan', 'rusak berat').optional(),
  jumlah_total: Joi.number().integer().min(0).required(),
  jumlah_tersedia: Joi.number().integer().min(0).required(),
  lokasi_penyimpanan: Joi.string().max(100).optional(),
  gambar_url: Joi.string().max(255).optional(),
});

export const updateAlatSchema = Joi.object({
  kode_alat: Joi.string().max(50).optional(),
  nama_alat: Joi.string().max(100).optional(),
  kategori_id: Joi.number().integer().optional(),
  deskripsi: Joi.string().optional(),
  kondisi: Joi.string().valid('baik', 'rusak ringan', 'rusak berat').optional(),
  jumlah_total: Joi.number().integer().min(0).optional(),
  jumlah_tersedia: Joi.number().integer().min(0).optional(),
  lokasi_penyimpanan: Joi.string().max(100).optional(),
  gambar_url: Joi.string().max(255).optional(),
});
