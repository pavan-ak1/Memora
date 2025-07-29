import { Router } from "express";
import userMiddleware from "../middleware/userMiddleware";
import { toggleShare, getSharedContent } from "../controllers/shareController";

const router = Router();

// Toggle sharing for user's content (requires authentication)
router.post("/share", userMiddleware, toggleShare);

// Create a separate router for public routes
const publicRouter = Router();

// Get shared content by share link (public access - no authentication)
publicRouter.get("/shared/:shareLink", getSharedContent);

export { router as shareRoutes, publicRouter as publicShareRoutes };
