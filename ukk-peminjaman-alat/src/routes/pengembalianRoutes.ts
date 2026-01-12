import { Router } from 'express';
import { PengembalianController } from '../controllers/pengembalianController';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleCheck';
import { validate } from '../middlewares/validation';
import { createPengembalianSchema } from '../validators/peminjamanValidator';

const router = Router();

router.use(authenticate);

router.get('/', PengembalianController.getAll);
router.get('/:id', PengembalianController.getById);

router.post('/', checkRole('petugas', 'admin', 'peminjam'), validate(createPengembalianSchema), PengembalianController.create);

export default router;