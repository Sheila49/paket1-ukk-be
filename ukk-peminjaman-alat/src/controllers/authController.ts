import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { LogService } from '../services/logService';

export class AuthController {
  // ========================= REGISTER =========================
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, nama_lengkap } = req.body;

      // cek apakah user sudah ada
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        res.status(400).json({ message: 'Username sudah terdaftar' });
        return;
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // buat user baru dengan role default 'peminjam'
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        nama_lengkap,
        role: 'peminjam',   // ✅ default role peminjam
        is_active: true,    // default aktif
      });

      // log aktivitas
      await LogService.createLog(
        newUser.id,
        'REGISTER',
        'users',
        newUser.id,
        `User ${newUser.username} berhasil register`,
        req
      );

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          nama_lengkap: newUser.nama_lengkap,
          role: newUser.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ========================= LOGIN =========================
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      // cari user berdasarkan username atau email
      const user = await User.findOne({
        where: username ? { username } : { email },
      });

      if (!user || !user.is_active) {
        res.status(401).json({ message: 'Username atau password salah' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ message: 'Username atau password salah' });
        return;
      }

      // JWT setup
      const jwtSecret: string = process.env.JWT_SECRET || 'secret';
      const rawExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

      const options: SignOptions = {
        expiresIn: rawExpiresIn as SignOptions['expiresIn'],
      };

      const payload = { id: user.id, username: user.username, role: user.role };
      const token = jwt.sign(payload, jwtSecret, options);

      await LogService.createLog(
        user.id,
        'LOGIN',
        'users',
        user.id,
        `User ${user.username} berhasil login`,
        req
      );

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            nama_lengkap: user.nama_lengkap,
            role: user.role,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ========================= LOGOUT =========================
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      if (req.user) {
        await LogService.createLog(
          req.user.id,
          'LOGOUT',
          'users',
          req.user.id,
          `User ${req.user.username} logout`,
          req
        );
      }

      res.json({ success: true, message: 'Logout berhasil' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ========================= ME =========================
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findByPk(req.user!.id, {
        attributes: { exclude: ['password'] },
      });

      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}