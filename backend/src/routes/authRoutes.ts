import { Router } from "express";
import { signup, signin } from "../controllers/authController";
import userMiddleware from "../middleware/userMiddleware";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

export default router;
