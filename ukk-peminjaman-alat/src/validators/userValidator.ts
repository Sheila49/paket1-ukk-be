import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9_.-]+$/)
    .min(3)
    .max(50)
    .required(),
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),
  password: Joi.string()
    .min(6)
    .max(128)
    .required(),
  nama_lengkap: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),
  role: Joi.string()
    .valid('admin', 'petugas', 'peminjam')
    .required(),
  no_telepon: Joi.string()
    .trim()
    .pattern(/^[0-9+\-()\s]+$/)
    .max(20)
    .optional(),
  alamat: Joi.string()
    .trim()
    .max(255)
    .optional(),
}).options({ abortEarly: false, stripUnknown: true });

export const updateUserSchema = Joi.object({
  username: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9_.-]+$/)
    .min(3)
    .max(50)
    .optional(),
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .optional(),
  password: Joi.string()
    .min(6)
    .max(128)
    .optional(),
  nama_lengkap: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional(),
  role: Joi.string()
    .valid('admin', 'petugas', 'peminjam')
    .optional(),
  no_telepon: Joi.string()
    .trim()
    .pattern(/^[0-9+\-()\s]+$/)
    .max(20)
    .optional(),
  alamat: Joi.string()
    .trim()
    .max(255)
    .optional(),
  is_active: Joi.boolean().optional(),
}).options({ abortEarly: false, stripUnknown: true });

export const loginSchema = Joi.object({
  username: Joi.string().trim().optional(),
  email: Joi.string().trim().lowercase().email().optional(),
  password: Joi.string().required(),
})
  .xor('username', 'email')
  .options({ abortEarly: false, stripUnknown: true });