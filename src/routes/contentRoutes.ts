import { Router } from 'express';
import userMiddleware from '../middleware/userMiddleware';
import { addContent } from '../controllers/contentController';
const router = Router();

router.post('/' ,userMiddleware,addContent);


export default router;
