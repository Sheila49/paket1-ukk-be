import { Router } from 'express';
import { PeminjamanController } from '../controllers/peminjamanController';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleCheck';
import { validate } from '../middlewares/validation';
import { createPeminjamanSchema, approvePeminjamanSchema } from '../validators/peminjamanValidator';

const router = Router();

router.use(authenticate);

// GET
router.get('/', PeminjamanController.getAll);
router.get('/user', checkRole('peminjam'), PeminjamanController.getByUser);
router.get('/:id', PeminjamanController.getById);

// CREATE
router.post('/', checkRole('peminjam'), validate(createPeminjamanSchema), PeminjamanController.create);

// APPROVE / REJECT
router.patch('/:id/approve', checkRole('petugas', 'admin'), validate(approvePeminjamanSchema), PeminjamanController.approve);
router.patch('/:id/reject', checkRole('petugas', 'admin'), validate(approvePeminjamanSchema), PeminjamanController.reject);

// UPDATE / DELETE (opsional, kalau memang dipakai)
router.put('/:id', checkRole('petugas', 'admin'), PeminjamanController.update);
router.delete('/:id', checkRole('petugas', 'admin'), PeminjamanController.delete);

export default router;