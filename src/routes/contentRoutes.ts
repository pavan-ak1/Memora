import { Router } from 'express';
import userMiddleware from '../middleware/userMiddleware';
import { addContent, deleteContents, getContents } from '../controllers/contentController';

const router = Router();

router.post('/', userMiddleware, addContent);
router.get("/", userMiddleware, getContents);

router.delete('/:id', userMiddleware, deleteContents); 

export default router;
