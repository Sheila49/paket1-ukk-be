import { Router } from 'express';
import { LaporanController } from '../controllers/laporanController';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleCheck';

const router = Router();

router.use(authenticate);
router.use(checkRole('admin', 'petugas')); // Hanya admin dan staff yang boleh mengakses laporan

router.get('/peminjaman/pdf', LaporanController.downloadPDF);
router.get('/peminjaman/excel', LaporanController.downloadExcel);

export default router;
