import { Router } from 'express';
import { AlatController } from '../controllers/alatController';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleCheck';
import { validate } from '../middlewares/validation';
import { createAlatSchema, updateAlatSchema } from '../validators/alatValidator';

const router = Router();

router.use(authenticate);

router.get('/', AlatController.getAll);
router.get('/:id', AlatController.getById);

router.use(checkRole('admin'));

router.post('/', validate(createAlatSchema), AlatController.create);
router.put('/:id', validate(updateAlatSchema), AlatController.update);
router.delete('/:id', AlatController.delete);

export default router;