import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middlewares/validation';
import { registerSchema, loginSchema } from '../validators/userValidator';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);

export default router;