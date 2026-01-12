import { Router } from 'express';
import { LogController } from '../controllers/logController';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleCheck';

const router = Router();

router.use(authenticate);
router.use(checkRole('admin'));

router.get('/', LogController.getAll);

export default router;
