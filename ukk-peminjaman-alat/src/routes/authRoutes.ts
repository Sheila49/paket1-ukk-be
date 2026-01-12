import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { loginSchema } from '../validators/userValidator';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
