import { Router } from 'express';
import { KategoriController } from '../controllers/kategoriController';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleCheck';

const router = Router();

router.use(authenticate);

router.get('/', KategoriController.getAll);
router.get('/:id', KategoriController.getById);

router.use(checkRole('admin'));

router.post('/', KategoriController.create);
router.put('/:id', KategoriController.update);
router.delete('/:id', KategoriController.delete);

export default router;
