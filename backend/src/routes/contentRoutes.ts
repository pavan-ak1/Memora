import { Router } from "express";
import userMiddleware from "../middleware/userMiddleware";
import {
  addContent,
  deleteContents,
  getContents,
  searchContent,
} from "../controllers/contentController";

const router = Router();

router.post("/", userMiddleware, addContent);
router
  .get("/", userMiddleware, getContents)
  .get("/title", userMiddleware, searchContent);

router.delete("/:id", userMiddleware, deleteContents);

export default router;
