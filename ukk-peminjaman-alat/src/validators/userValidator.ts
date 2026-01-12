import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nama_lengkap: Joi.string().min(3).max(100).required(),
  role: Joi.string().valid('admin', 'petugas', 'peminjam').required(),
  no_telepon: Joi.string().max(20).optional(),
  alamat: Joi.string().optional(),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  nama_lengkap: Joi.string().min(3).max(100).optional(),
  role: Joi.string().valid('admin', 'petugas', 'peminjam').optional(),
  no_telepon: Joi.string().max(20).optional(),
  alamat: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
