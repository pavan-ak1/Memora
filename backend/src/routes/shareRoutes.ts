import { Router } from "express";
import userMiddleware from "../middleware/userMiddleware";
import {
  shareContent,
  sharedLinkLogic,
} from "../controllers/contentController";

const router = Router();

router.post("/brain/share", userMiddleware, shareContent);
router.get("/brain/:shareLink", sharedLinkLogic);

export default router;
