import { Router } from 'express';
import { signup, signin } from '../controllers/authController';
import { validateSignup, validateSignin } from '../middleware/validateMiddleware';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);

export default router;
