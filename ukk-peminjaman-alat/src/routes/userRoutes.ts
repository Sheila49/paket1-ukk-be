import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleCheck';
import { validate } from '../middlewares/validation';
import { createUserSchema, updateUserSchema } from '../validators/userValidator';

const router = Router();

router.use(authenticate);
router.use(checkRole('admin'));

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', validate(createUserSchema), UserController.create);
router.put('/:id', validate(updateUserSchema), UserController.update);
router.delete('/:id', UserController.delete);

export default router;