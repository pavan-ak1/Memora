import { Router } from "express";
import userMiddleware from "../middleware/userMiddleware";
import {
  addContent,
  deleteContents,
  getContents,
} from "../controllers/contentController";

const router = Router();

router
  .route("/")
  .post(userMiddleware, addContent)
  .get(userMiddleware, getContents);

router.route("/:id").delete(userMiddleware, deleteContents);

export default router;
