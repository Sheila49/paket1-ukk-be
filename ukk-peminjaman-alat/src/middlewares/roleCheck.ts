import { Request, Response, NextFunction } from 'express';

export const checkRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Akses ditolak. Role tidak sesuai.' });
      return;
    }

    next();
  };
};
