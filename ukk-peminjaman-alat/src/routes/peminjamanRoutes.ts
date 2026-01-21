import { Router } from 'express';
import { PeminjamanController } from '../controllers/peminjamanController';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleCheck';
import { validate } from '../middlewares/validation';
import { createPeminjamanSchema, approvePeminjamanSchema } from '../validators/peminjamanValidator';

const router = Router();

router.use(authenticate);

router.get('/', PeminjamanController.getAll);
router.get('/:id', PeminjamanController.getById);

router.get('/user/:id', checkRole('peminjam'), PeminjamanController.getByUser)

router.post('/', checkRole('peminjam'), validate(createPeminjamanSchema), PeminjamanController.create);

router.put('/:id/approve', checkRole('petugas', 'admin'), validate(approvePeminjamanSchema), PeminjamanController.approve);
router.put('/:id/reject', checkRole('petugas', 'admin'), validate(approvePeminjamanSchema), PeminjamanController.reject);

export default router;
