import { Request } from 'express';
import Log from '../models/Log';

export class LogService {
  static async createLog(
    userId: number | undefined,
    aksi: string,
    tabel: string,
    recordId: number | undefined,
    detail: string,
    req?: Request
  ): Promise<void> {
    try {
      await Log.create({
        user_id: userId,
        aksi,
        tabel,
        record_id: recordId,
        detail,
        ip_address: req?.ip,
        user_agent: req?.headers['user-agent'],
      });
    } catch (error) {
      console.error('Error creating log:', error);
    }
  }
}
